from functools import reduce

# dBKeyBitsAndValues 	= [[keyOneBits,keyOneValue], [keyTwoBits,keyTwoValue], [keyThreeBits,keyThreeValue], [keyFourBits,keyFourValue]]

# oneVal = 1

# negOneVal = -1



# serialized = example.Serialized()
# example.ReadSerializationFromFile(SparkFiles.get('cryptocontext.cc'), serialized)
# cryptoContext = example.CryptoContextFactory.DeserializeAndCreateContext(serialized, False)


import fhe

userId
colId
ccId
keyId


valueQuery = """SELECT ctext_key_bit_data as ckbd, 
bit_id as bi,
kv_pair_id as kpi
from user_ciphertext_keys_bitwise
where user_id           = %d
and collection_id       = %d
and cryptocontext_id    = %d
and keypair_id          = %d""" % (userId, colId, ccId, keyId)

keyBitQuery = """SELECT ctext_value_data as cvd, 
kv_pair_id as kpi
from user_ciphertext_values
where user_id           = %d
and collection_id       = %d
and cryptocontext_id    = %d
and keypair_id          = %d""" % (userId, colId, ccId, keyId)

df_keybits = sqlContext.read.\
                        format("jdbc").\
                        option("url", "jdbc:mysql://localhost/uber").\
                        option("driver", "com.mysql.jdbc.Driver").\
                        option("dbtable", "trips").\
                        option("user", "root").\
                        option("password", "root").\
                        sql(keyBitQuery)

df_keybits

class XnorPYSpark(object):
	"""class to perform all fhe query operations"""
	def __init__(self, cryptoContext, pubkey, dbinfo):
		super(ClassName, self).__init__()
		self.cryptoContext 	= cryptoContext
		self.pubkey 		= pubkey
		self.dbinfo 		= dbinfo

		self.oneVal 	= cryptoContext.encrypt(cryptoContext, pubkey, 1)
		self.negOneVal 	= cryptoContext.encrypt(cryptoContext, pubkey, -1)

	def getAllDBKeyValueBitTuples():
		return (something with self.dbinfo)
	


	def add(one, two):
		return cryptoContext.EvalAdd(one, two)

	def mult(one, two):
		return cryptoContext.EvalMult(one, two)

	def sub(one, two):
		return cryptoContext.EvalAdd(one, (cryptoContext.EvalMult(two, self.negOneVal)))

	def doBinaryXnorBit(dbBit, queryBit):

		# A' = A - 1
		# B' = B - 1
		dbBitMinus1 	= sub(dbBit, oneVal)
		queryBitMinus1 	= sub(queryBit, oneVal)

		# C = (A x B)+(A' x B')
		xnorLeftResult 	= mult(dbBit, queryBit)
		xnorrightResult = mult(dbBitMinus1, queryBitMinus1)

		xnorResultBoth 	= add(xnorLeftResult, xnorrightResult)

		return xnorResultBoth

	# print(map(lambda dbKeyAndVal: doKeyXnor(dbKeyAndVal[0], queryKeyBits), dBKeyBitsAndValues))

	def doKeyXnor(dbKeyBits):
		return reduce(mult, map(lambda x, queryKeyBits=queryKeyBits: doBinaryXnorBit(x[0],x[1]), zip(dbKeyBits, queryKeyBits)))


	def doKeyAndValueXnor(dbKeyBitsAndValue):
		return mult(doKeyXnor(dbKeyBitsAndValue[0]), dbKeyBitsAndValue[1])

	def doAllKeyValueXnors(allDBKeyBitsAndValue):
		return reduce(add, map(doKeyAndValueXnor, allDBKeyBitsAndValue), 0)

	def queryAll(dBKeyBitsAndValues):
		# dBKeyBitsAndValues 	= [[keyOneBits,keyOneValue], [keyTwoBits,keyTwoValue], [keyThreeBits,keyThreeValue], [keyFourBits,keyFourValue]]

	queryKeyBits = [1,1]
	print(doAllKeyValueXnors(dBKeyBitsAndValues))
	# # is used to make a copy of queryKeyBits for each dbKeyBitArray
	# map(lambda keyBitsAndValue: mult(keyBitsAndValue[1],doKeyXnor(keyBitsAndValue[0], queryKeyBits), dBKeyBitsAndValues))



if __name__ == '__main__':
	spark = SparkSession\
			.builder\
			.appName('xnor_spark')\
			.getOrCreate()

	spark.sparkContext.setLogLevel('ERROR')
	
	serializedCC = example.Serialized()
	example.ReadSerializationFromFile(SparkFiles.get('cryptocontext.cc'), serializedCC)
	cryptoContext = example.CryptoContextFactory.DeserializeAndCreateContext(serializedCC, False)

	# serializedPubKey = example.Serialized()
	# example.ReadSerializationFromFile(SparkFiles.get('key.pub'), serializedPubKey)
	# pubKey = example.SerializationToString(serializedPubKey, '')[1]

	serializedQuery = example.Serialized()
	example.ReadSerializationFromFile(SparkFiles.get('query.enc'), serializedQuery)
    queryCT = cryptoContext.deserializeCiphertext(serializedQuery)

    kvPairIdList = SparkFiles.get('kvpairids.txt').split()



    dataframe_mysql = sqlContext.read.format("jdbc").options(
		url ="jdbc:mysql://localhost/mysql",
		driver="com.mysql.jdbc.Driver",
		dbtable="user",
		user="root",
		password=""
		).load()



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
        Usage: xnor_spark
    '''

    spark = SparkSession\
            .builder\
            .appName('xnor_spark')\
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
