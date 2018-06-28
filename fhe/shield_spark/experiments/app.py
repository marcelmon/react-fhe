from __future__ import print_function

import sys
import os
import time
import example

from pyspark.sql import SparkSession
from pyspark.sql import functions as F

def showdf(df):
    df.show()
    print(df.rdd.getNumPartitions(), "partitions")
    def f(iterator):
        names = []
        for x in iterator:
            names.append(x['name'])
        return names
    print(list(map(f, df.rdd.glom().collect())))

if __name__ == '__main__':
    '''
        Usage: app [names]
    '''
    spark = SparkSession\
            .builder\
            .appName('app')\
            .getOrCreate()

    spark.sparkContext.setLogLevel('ERROR')

    parallelism = spark.sparkContext.defaultParallelism
    print('defaultParallelism:', parallelism)

    names = []
    names.append(sys.argv[1] if len(sys.argv) > 1 else 'Alice')
    names.append(sys.argv[2] if len(sys.argv) > 2 else 'Bob')

    # PostgreSQL read and write binary data
    # https://spark.apache.org/docs/latest/sql-programming-guide.html#jdbc-to-other-databases
    # StringType, BinaryType
    predicates = []
    for i in range(parallelism):
        predicates.append("get_byte(value, 0) % " + str(parallelism) + " = " + str(i))
    start = time.time()
    print('Reading mydb...');
    df = spark.read \
            .jdbc('jdbc:postgresql:mydb', 'public.binaries',
                    properties={'user': 'matthew', 'password': 'asdf'},
                    predicates=predicates)
    end = time.time()
    print('...took', end - start)

    # This is needed
    # https://stackoverflow.com/questions/41873495/spark-sql-and-mysql-savemode-overwrite-not-inserting-modified-data
    df.cache()

    if 'SHOWDF' in os.environ:
        showdf(df)

    # Arbitrary operation...XOR each name's value with random data and
    # write the result back to the name's value
    size = 1000000
    values = []
    rands = [bytearray(os.urandom(size)), bytearray(os.urandom(size))]
    results = []
    found = [False, False]
    for i in range(2):
        collection = df.filter(df['name'].like(names[i])) \
                .select(df['value']) \
                .collect()
        # If a name DNE or its value's size is unexpected
        if not collection or len(collection[0].value) != size:
            if collection:
                found[i] = True
            values.append(bytearray(os.urandom(size)))
        else:
            found[i] = True
            values.append(collection[0].value)
        results.append(bytearray(size))

        start = time.time()
        print('XORing', names[i], 'with random data in python...')
        for j in range(size):
            results[i][j] = values[i][j] ^ rands[i][j]
        end = time.time()
        print('...took', end - start, 'and got', results[i][:6].hex());

        start = time.time()
        print('XORing', names[i], 'with random data in C++...')
        results[i] = bytearray(example.nothing(bytes(values[i]),
            bytes(rands[i])))
        end = time.time()
        print('...took', end - start, 'and got', results[i][:6].hex());

    start = time.time()
    print("Creating new DataFrame...")
    df = df.withColumn('value', F \
            .when(df['name'] == names[0], results[0]) \
            .when(df['name'] == names[1], results[1]) \
            .otherwise(df['value']))
    for i in range(2):
        if not found[i]:
            df = df.union(spark.createDataFrame([(names[i], results[i])],
                ['name', 'value']))
    end = time.time()
    print("...took", end - start);

    if 'SHOWDF' in os.environ:
        showdf(df)

    # Parallel write works
    # 17/11/26 20:21:27 WARN TaskSetManager: Stage 3 contains a task of very large size (981 KB). The maximum recommended task size is 100 KB.
    start = time.time()
    print('Writing mydb...');
    df.write.jdbc('jdbc:postgresql:mydb', 'public.binaries',
            properties={'user': 'matthew', 'password': 'asdf'},
            mode='overwrite')#.option('numPartitions', 1) \
    end = time.time()
    print('...took', end - start);

    spark.stop()
