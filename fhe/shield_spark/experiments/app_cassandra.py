
from __future__ import print_function

import sys
import os
import time
import example

from pyspark.sql import SparkSession
from pyspark.sql import functions as F

if __name__ == '__main__':
    '''
        Usage: app [names]
    '''
    spark = SparkSession\
            .builder\
            .appName('app')\
            .getOrCreate()

    spark.sparkContext.setLogLevel('ERROR')

    if 'BOOTSTRAP' in os.environ:
        size = 1000000
        names = ['Alice', 'Bob']
        rands = [bytearray(os.urandom(size)), bytearray(os.urandom(size))]
        df = spark.createDataFrame([(names[0], rands[0]), (names[1], rands[1])], ['name', 'value'])
    else:
        start = time.time()
        print('Reading mydb...');
        df = spark.read\
                .format("org.apache.spark.sql.cassandra")\
                .options(table="kv", keyspace="test")\
                .load()
        end = time.time()
        print('...took', end - start)

    print(df.rdd.getNumPartitions(), "partitions")
    def f(iterator):
        names = []
        for x in iterator:
            names.append(x['name'])
        return names
    print(list(map(f, df.rdd.glom().collect())))

    start = time.time()
    print('Writing mydb...');
    df.write\
            .format("org.apache.spark.sql.cassandra")\
            .mode('append')\
            .options(table='kv', keyspace='test')\
            .save()
    end = time.time()
    print('...took', end - start);

    spark.stop()
