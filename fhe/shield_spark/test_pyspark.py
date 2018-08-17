# spark-submit /var/www/html/FHSearch/test_pyspark.py --jars /home/marcel/spark/mysql-connector-java-8.0.12/mysql-connector-java-8.0.12.jar --driver-class-path=/home/marcel/spark/mysql-connector-java-8.0.12/mysql-connector-java-8.0.12.jar


#spark-submit /var/www/html/FHSearch/test_pyspark.py --packages mysql:mysql-connector-java:8.0.12

#spark-submit /var/www/html/FHSearch/test_pyspark.py --jars /home/marcel/spark/mysql-connector-java-8.0.12/mysql-connector-java-8.0.12.jar --driver-class-path=/home/marcel/spark/mysql-connector-java-8.0.12/mysql-connector-java-8.0.12.jar

from __future__ import print_function
from itertools import islice

queryKeyBits = -1

import sys
# import os
# import glob
# import time
# import example
# import pathlib
# import hashlib

from pyspark.sql import SparkSession
from pyspark.sql import functions
from pyspark.sql import Row
from pyspark.sql.types import StringType
from pyspark.files import SparkFiles


dbpass = ""
# from pyspark.sql.functions import *

# # dBKeyBitsAndValues 	= [[keyOneBits,keyOneValue], [keyTwoBits,keyTwoValue], [keyThreeBits,keyThreeValue], [keyFourBits,keyFourValue]]

# # oneVal = 1

# # negOneVal = -1



# # serialized = example.Serialized()
# # example.ReadSerializationFromFile(SparkFiles.get('cryptocontext.cc'), serialized)
# # cryptoContext = example.CryptoContextFactory.DeserializeAndCreateContext(serialized, False)


userId  = 1
colId   = 1
ccId    = 1
keyId   = 1
numBits = 2

def buildSingleBitSubQuery(userId, colId, ccId, keyId, bit):
    return """(
    SELECT ctext_key_bit_data,
    kv_pair_id
    from test_pt_user_ciphertext_keys_bitwise
    where bit_id = %d
    and   test_pt_user_ciphertext_keys_bitwise.user_id            = %d
    and   test_pt_user_ciphertext_keys_bitwise.collection_id      = %d
    and   test_pt_user_ciphertext_keys_bitwise.cryptocontext_id   = %d
    and   test_pt_user_ciphertext_keys_bitwise.keypair_id         = %d
    )as uckb_%d\n""" % (bit, userId, colId, ccId, keyId, bit)

def buildFullQuery(userId, colId, ccId, keyId, numBits):

    return """SELECT test_pt_user_ciphertext_values.ctext_value_data as cvd,
    """+(",\n".join(["uckb_"+str(bit)+".ctext_key_bit_data as b_"+str(bit) for bit in range(numBits)]))\
    +"""\nfrom test_pt_user_ciphertext_values 
    left join\n"""\
    +("\nleft join\n".join([buildSingleBitSubQuery(userId, colId, ccId, keyId, bit)+"\non uckb_%d.kv_pair_id = test_pt_user_ciphertext_values.kv_pair_id"%(bit) for bit in range(numBits)]))\
    +"""\nwhere test_pt_user_ciphertext_values.user_id      = %d
    and   test_pt_user_ciphertext_values.collection_id      = %d
    and   test_pt_user_ciphertext_values.cryptocontext_id   = %d
    and   test_pt_user_ciphertext_values.keypair_id         = %d""" %( userId, colId, ccId, keyId)


print(buildFullQuery(userId, colId, ccId, keyId, numBits))


# import fhe

# userId  = 665
# colId   = 6
# ccId    = 5
# keyId   = 5

# fullQuery = """SELECT


# select uckb_0.bit_id as b_0,
# uckb_1.bit_id as b_1,
# uckb_2.bit_id as b_2,
# uckb_3.bit_id as b_3,
# uckb_4.bit_id as b_4,
# uckb_5.bit_id as b_5,
# uckb_6.bit_id as b_6,
# user_ciphertext_values.kv_pair_id as cvd,
# user_ciphertext_values.kv_pair_id as kpi
# from
# user_ciphertext_values
# (
#     SELECT bit_id
#     from user_ciphertext_keys_bitwise
#     where bit_id = 0
#     and   user_ciphertext_keys_bitwise.user_id            = 665
#     and   user_ciphertext_keys_bitwise.collection_id      = 6
#     and   user_ciphertext_keys_bitwise.cryptocontext_id   = 5
#     and   user_ciphertext_keys_bitwise.keypair_id         = 5
# ) as uckb_0
# right join
# (
#     SELECT bit_id
#     from user_ciphertext_keys_bitwise
#     where bit_id = 1
#     and   user_ciphertext_keys_bitwise.user_id            = 665
#     and   user_ciphertext_keys_bitwise.collection_id      = 6
#     and   user_ciphertext_keys_bitwise.cryptocontext_id   = 5
#     and   user_ciphertext_keys_bitwise.keypair_id         = 5
# ) as uckb_1
# right join user_ciphertext_values
# on user_ciphertext_values.kv_pair_id    = uckb_0.kv_pair_id
# and user_ciphertext_values.kv_pair_id   = uckb_1.kv_pair_id
# where user_ciphertext_values.user_id            = 665
# and   user_ciphertext_values.collection_id      = 6
# and   user_ciphertext_values.cryptocontext_id   = 5
# and   user_ciphertext_values.keypair_id         = 5


# SELECT uckb_0.bit_id as b_0,
# uckb_1.bit_id as b_1,
# uckb_2.bit_id as b_2,
# uckb_3.bit_id as b_3,
# uckb_4.bit_id as b_4,
# uckb_5.bit_id as b_5,
# uckb_6.bit_id as b_6,
# user_ciphertext_values.kv_pair_id as cvd,
# user_ciphertext_values.kv_pair_id as kpi
# from
# user_ciphertext_keys_bitwise uckb_0
#     inner join  
# user_ciphertext_keys_bitwise uckb_1
#     inner join 
# user_ciphertext_keys_bitwise uckb_2
#     inner join 
# user_ciphertext_keys_bitwise uckb_3
#     inner join 
# user_ciphertext_keys_bitwise uckb_4
#     inner join 
# user_ciphertext_keys_bitwise uckb_5
#     right join 
# user_ciphertext_keys_bitwise uckb_6
#     right join
# user_ciphertext_values
# on user_ciphertext_values.kv_pair_id    = uckb_0.kv_pair_id
# and user_ciphertext_values.kv_pair_id   = uckb_1.kv_pair_id
# and user_ciphertext_values.kv_pair_id   = uckb_2.kv_pair_id
# and user_ciphertext_values.kv_pair_id   = uckb_3.kv_pair_id
# and user_ciphertext_values.kv_pair_id   = uckb_4.kv_pair_id
# and user_ciphertext_values.kv_pair_id   = uckb_5.kv_pair_id
# and user_ciphertext_values.kv_pair_id   = uckb_6.kv_pair_id
# where uckb_0.bit_id = 0
# and   uckb_1.bit_id = 1
# and   uckb_2.bit_id = 2
# and   uckb_3.bit_id = 3
# and   uckb_4.bit_id = 4
# and   uckb_5.bit_id = 5
# and   uckb_6.bit_id = 6
# and   user_ciphertext_values.user_id            = 665
# and   user_ciphertext_values.collection_id      = 6
# and   user_ciphertext_values.cryptocontext_id   = 5
# and   user_ciphertext_values.keypair_id         = 5
# """
# valueQuery = """SELECT ctext_key_bit_data as ckbd, 
# bit_id as bi,
# kv_pair_id as kpi
# from user_ciphertext_keys_bitwise
# where user_id           = %d
# and collection_id       = %d
# and cryptocontext_id    = %d
# and keypair_id          = %d""" % (userId, colId, ccId, keyId)

# keyBitQuery = """SELECT ctext_value_data as cvd, 
# kv_pair_id as kpi
# from user_ciphertext_values
# where user_id           = %d
# and collection_id       = %d
# and cryptocontext_id    = %d
# and keypair_id          = %d""" % (userId, colId, ccId, keyId)


negOneVal   = -1
oneVal      = 1

def add(one, two):
    return one + two

def mult(one, two):
    return one * two

def sub(one, two):
    return add(one, (mult(two, negOneVal)))

def doBinaryXnorBit(dbBit, queryBit):

    # A' = A - 1
    # B' = B - 1
    dbBitMinus1     = sub(dbBit, oneVal)
    queryBitMinus1  = sub(queryBit, oneVal)

    # C = (A x B)+(A' x B')
    xnorLeftResult  = mult(dbBit, queryBit)
    xnorrightResult = mult(dbBitMinus1, queryBitMinus1)

    xnorResultBoth  = add(xnorLeftResult, xnorrightResult)

    return xnorResultBoth

def doKeyXnor(dbKeyBits):
    return reduce(mult, map(lambda x, queryKeyBits=queryKeyBits: doBinaryXnorBit(x[0],x[1]), zip(dbKeyBits, queryKeyBits)))

def doKeyAndValueXnor(dbKeyBitsAndValue):
    return mult(doKeyXnor(dbKeyBitsAndValue[1]), dbKeyBitsAndValue[0])

def doAllKeyValueXnors(allDBKeyBitsAndValue):
    return allDBKeyBitsAndValue.map(doKeyAndValueXnor).reduce(add)





# return allDBKeyBitsAndValue.map(\
#     lambda kvRow: mult(\
#         zip(kvRow[1], queryKeyBits).map(lambda keyAndQueryBit: doBinaryXnorBit[keyAndQueryBit[0], keyAndQueryBit[1]]).reduce(mult)\ # key bit xnors
#         kvRow[0]\ #mult the bitwise xnor result to the value
#         )\
#     ).\
#     reduce(add) # add all results together

# def doAllKeyValueXnorsLamdaMap(kvRow):
#     return 

# def doAllKeyValueXnorsLamda(allDBKeyBitsAndValue):
#     return allDBKeyBitsAndValue.map(\
#         lambda kvRow: mult(\
#             map(lambda keyAndQueryBit: doBinaryXnorBit(keyAndQueryBit[0], keyAndQueryBit[1]), zip(kvRow[1], queryKeyBits)).reduce(mult),\
#             kvRow[0]\
#             )\
#         ).\
#         reduce(add) # add all results together

spark = SparkSession\
            .builder\
            .appName('app_server')\
            .config('spark.driver.extraClassPath','/home/marcel/spark/spark-2.3.1-bin-hadoop2.7/jars/mysql-connector-java-8.0.12.jar')\
            .getOrCreate()

spark.sparkContext.setLogLevel('ERROR')


# load using the query
df_keybitsandvalues = spark.read.\
                        format("jdbc").\
                        option("url", "jdbc:mysql://localhost/fhe_test").\
                        option("user", "root").\
                        option("password", dbpass).\
                        option("driver", "com.mysql.jdbc.Driver").\
                        option("dbtable", "("+buildFullQuery(userId, colId, ccId, keyId, numBits)+") as the_table").\
                        load()


# combine the rows into rows of (value, [bit0,bit1,..])

new_df_keybitsandvalues = df_keybitsandvalues.rdd.map(lambda allCols: [allCols[0], [i for i in allCols[1:]]])


# new_df_keybitsandvalues_with_query = new_df_keybitsandvalues.map(lambda allCols, queryKeyBits=queryKeyBits: [allCols[0], zip(allCols[1], queryKeyBits)])




# new_df_keybitsandvalues.toDF().show()


print("now new new")

print("[0,0] expect 1")
queryKeyBits = [0,0]
# new_df_keybitsandvalues_with_query = new_df_keybitsandvalues.map(lambda allCols, queryKeyBits=queryKeyBits: [allCols[0], zip(allCols[1], queryKeyBits)])
# new_df_keybitsandvalues_with_query.toDF().show()
new_new_0 = doAllKeyValueXnors(new_df_keybitsandvalues)
print("answer : "+str(new_new_0))


print("[0,1] expect 2")
queryKeyBits = [0,1]
new_new_1 = doAllKeyValueXnors(new_df_keybitsandvalues)
print("answer : "+str(new_new_1))


print("[1,0] expect 3")
queryKeyBits = [1,0]
new_new_2 = doAllKeyValueXnors(new_df_keybitsandvalues)
print("answer : "+str(new_new_2))


print("[1,1] expect 4")
queryKeyBits = [1,1]
new_new_3 = doAllKeyValueXnors(new_df_keybitsandvalues)
print("answer : "+str(new_new_3))


spark.stop()





# def add(one, two):
#     return one + two

# def mult(one, two):
#     return one * two

# def sub(one, two):
#     return add(one, (mult(two, negOneVal)))

# def doBinaryXnorBit(dbBit, queryBit):

#     # A' = A - 1
#     # B' = B - 1
#     dbBitMinus1     = sub(dbBit, oneVal)
#     queryBitMinus1  = sub(queryBit, oneVal)

#     # C = (A x B)+(A' x B')
#     xnorLeftResult  = mult(dbBit, queryBit)
#     xnorrightResult = mult(dbBitMinus1, queryBitMinus1)

#     xnorResultBoth  = add(xnorLeftResult, xnorrightResult)

#     return xnorResultBoth


# def doKeyXnor(dbKeyBits):
#     return dbKeyBits.zip(queryKeyBits).map(lambda bothBits: doBinaryXnorBit[0], doBinaryXnorBit[1]).reduce(mult, 1)
#     # return reduce(mult, map(lambda x, queryKeyBits=queryKeyBits: doBinaryXnorBit(x[0],x[1]), zip(dbKeyBits, queryKeyBits)))

# def doKeyAndValueXnor(dbKeyBitsAndValue):
#     return mult(doKeyXnor(dbKeyBitsAndValue[0]), dbKeyBitsAndValue[1])

# def doAllKeyValueXnors(allDBKeyBitsAndValue):
#     return allDBKeyBitsAndValue.map(lambda kvRow: mult(doKeyXnor(kvRow[0]), kvRow[1])).reduce(add, 0)






# # import functions.*

# from pyspark.sql.functions import udf, col


# new_df_keybitsandvalues = df_keybitsandvalues.rdd.map(lambda allCols: [allCols[0], [i for i in allCols[2:]]])

# new_df_keybitsandvalues.toDF().show()

# new_df_keybitsandvalues = df_keybitsandvalues.select(col("cvd"), mergeCols(col(4), col(5)))

# # new_df_keybitsandvalues = df_keybitsandvalues.withColumn("Food", mergeCols(col("b_0"), col("b_1")))

# new_df_keybitsandvalues.show()






# """SELECT


# DROP TABLE if exists `test_pt_user_ciphertext_keys_bitwise`;

# CREATE TABLE `test_pt_user_ciphertext_keys_bitwise` (
#   `user_id` int(10) unsigned NOT NULL,
#   `collection_id` int(10) unsigned NOT NULL,
#   `cryptocontext_id` int(10) unsigned NOT NULL,
#   `keypair_id` int(10) unsigned NOT NULL,
#   `kv_pair_id` int(10) unsigned NOT NULL,
#   `bit_id` int(10) unsigned NOT NULL,
#   `ctext_key_bit_data` int(10),
#   `created_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
#   `last_updated` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
#   `json_array_sample` text,
#   PRIMARY KEY (`user_id`,`collection_id`,`cryptocontext_id`,`keypair_id`,`kv_pair_id`,`bit_id`)
# );

# -- insert using 2 bits
# -- keys will be 00, 01, 10, 11
# insert into test_pt_user_ciphertext_keys_bitwise
# (
#     user_id,
#     collection_id,
#     cryptocontext_id,
#     keypair_id,
#     kv_pair_id,
#     bit_id,
#     ctext_key_bit_data
# )
# values
# (1,1,1,1,1,0,0),(1,1,1,1,1,1,0),
# (1,1,1,1,2,0,0),(1,1,1,1,2,1,1),
# (1,1,1,1,3,0,1),(1,1,1,1,3,1,0),
# (1,1,1,1,4,0,1),(1,1,1,1,4,1,1)
# ;



# DROP TABLE if exists `test_pt_user_ciphertext_values`;

# CREATE TABLE `test_pt_user_ciphertext_values` (
#   `user_id` int(10) unsigned NOT NULL,
#   `collection_id` int(10) unsigned NOT NULL,
#   `cryptocontext_id` int(10) unsigned NOT NULL,
#   `keypair_id` int(10) unsigned NOT NULL,
#   `kv_pair_id` int(10) unsigned NOT NULL,
#   `ctext_value_data` INT(10),
#   `created_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
#   `last_updated` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
#   `json_array_sample` text,
#   PRIMARY KEY (`user_id`,`collection_id`,`cryptocontext_id`,`keypair_id`,`kv_pair_id`)
# );

# -- will insert values of 1, 2, 3, 4
# insert into test_pt_user_ciphertext_values
# (
#     user_id,
#     collection_id,
#     cryptocontext_id,
#     keypair_id,
#     kv_pair_id,
#     ctext_value_data
# )
# values
# (1,1,1,1,1,1),
# (1,1,1,1,2,2),
# (1,1,1,1,3,3),
# (1,1,1,1,4,4)
# ;
# """

