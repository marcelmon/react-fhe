from __future__ import print_function
from itertools import islice

import sys
import os
import glob
import time
import example
import pathlib
import hashlib

from pyspark.sql import SparkSession
from pyspark.sql import functions as F
from pyspark.sql import Row
from pyspark.sql.types import StringType
from pyspark.files import SparkFiles

if __name__ == '__main__':
    '''
        Usage: app_server
    '''

    spark = SparkSession\
            .builder\
            .appName('app_server')\
            .getOrCreate()

    spark.sparkContext.setLogLevel('ERROR')

    serialized = example.Serialized()
    print(SparkFiles.get('key.pub'))
    example.ReadSerializationFromFile(SparkFiles.get('key.pub'), serialized)
    m = hashlib.sha1()
    pubKey = example.SerializationToString(serialized, '')[1]
    m.update(pubKey.encode('utf-8'))
    dirName = m.hexdigest()[:3]
    print(dirName)

    # The "database"
    start = time.time()
    print('Reading files...')
    df = spark.read.text(glob.glob('./'+dirName+'/server/*.enc'))
    end = time.time()
    print('...took', end - start)
    df.show()
    print(df.rdd.getNumPartitions(), "partitions")
    if 'CASSANDRA' in os.environ:
        start = time.time()
        print('Reading cassandra table...')
        df = spark.read\
                .format("org.apache.spark.sql.cassandra")\
                .options(table='spark'+dirName, keyspace="test")\
                .load()
        df = df.drop('name')
        end = time.time()
        print('...took', end - start)
        df.show()
        print(df.rdd.getNumPartitions(), "partitions")
    elif 'POSTGRES' in os.environ:
        start = time.time()
        print('Reading postgres table...');
        df = spark.read \
                .jdbc('jdbc:postgresql:test', 'spark'+dirName,
                        properties={'user': 'postgres'})
        df = df.drop('name')
        end = time.time()
        print('...took', end - start)

    """
    # TODO how to deserialize cryptoContext once only
    bcCC = spark.sparkContext.broadcast(cryptoContext)
    bcCT = spark.sparkContext.broadcast(ciphertext)
    """

    def subQuery(ct):
        serialized = example.Serialized()
        example.ReadSerializationFromFile(SparkFiles.get('cryptocontext.cc'), serialized)
        cryptoContext = example.CryptoContextFactory.DeserializeAndCreateContext(serialized, False)

        example.ReadSerializationFromFile(SparkFiles.get('query.enc'), serialized)
        queryCT = cryptoContext.deserializeCiphertext(serialized)

        example.StringToSerialization(ct, serialized)
        dfCT = cryptoContext.deserializeCiphertext(serialized)
        
        result = cryptoContext.EvalSub(dfCT, queryCT)

        """
        # Verify that one of them subs to 0
        example.ReadSerializationFromFile(SparkFiles.get('key.sec'), serialized)
        secKey = cryptoContext.deserializeSecretKey(serialized)
        plaintextDec = example.IntPlaintextEncoding([])
        decryptResult = cryptoContext.Decrypt(secKey, [result], plaintextDec, True)
        plaintextDec = example.decodeInts(plaintextDec)
        plaintextDec = plaintextDec[:decryptResult.messageLength]
        print(all(v == 0 for v in plaintextDec))
        """

        result.Serialize(serialized)
        return example.SerializationToString(serialized, '')[1]
        
    def mult(ct1, ct2):
        serialized = example.Serialized()
        example.ReadSerializationFromFile(SparkFiles.get('cryptocontext.cc'), serialized)
        cryptoContext = example.CryptoContextFactory.DeserializeAndCreateContext(serialized, False)

        ct1 = ct1.value
        example.StringToSerialization(ct1, serialized)
        ct1 = cryptoContext.deserializeCiphertext(serialized)

        ct2 = ct2.value
        example.StringToSerialization(ct2, serialized)
        ct2 = cryptoContext.deserializeCiphertext(serialized)

        result = cryptoContext.EvalMult(ct1, ct2)

        """
        # Verify that one of them mults to 0
        example.ReadSerializationFromFile(SparkFiles.get('key.sec'), serialized)
        secKey = cryptoContext.deserializeSecretKey(serialized)
        plaintextDec = example.IntPlaintextEncoding([])
        decryptResult = cryptoContext.Decrypt(secKey, [result], plaintextDec, True)
        plaintextDec = example.decodeInts(plaintextDec)
        plaintextDec = plaintextDec[:decryptResult.messageLength]
        print(all(v == 0 for v in plaintextDec))
        """

        result.Serialize(serialized)
        return Row(value=example.SerializationToString(serialized, '')[1])

    subQuery_udf = F.udf(subQuery, StringType())
    df2 = df.withColumn('value', subQuery_udf('value'))

    result = df2.rdd.reduce(mult).value
    example.StringToSerialization(result, serialized)
    example.WriteSerializationToFile(serialized, './'+dirName+'/client/result.enc')

    spark.stop()
