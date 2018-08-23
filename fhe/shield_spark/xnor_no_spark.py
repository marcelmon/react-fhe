# spark-submit /var/www/html/FHSearch/test_pyspark.py --jars /home/marcel/spark/mysql-connector-java-8.0.12/mysql-connector-java-8.0.12.jar --driver-class-path=/home/marcel/spark/mysql-connector-java-8.0.12/mysql-connector-java-8.0.12.jar


#spark-submit /var/www/html/FHSearch/test_pyspark.py --packages mysql:mysql-connector-java:8.0.12

#spark-submit /var/www/html/FHSearch/test_pyspark.py --jars /home/marcel/spark/mysql-connector-java-8.0.12/mysql-connector-java-8.0.12.jar --driver-class-path=/home/marcel/spark/mysql-connector-java-8.0.12/mysql-connector-java-8.0.12.jar





# THIS ONEEEEEEE
# /home/marcel/spark/spark-2.3.1-bin-hadoop2.7/bin/spark-submit /var/www/html/FHSearch/fhe/shield_spark/test_pyspark_ctext.py --packages mysql:mysql-connector-java:8.0.12 --py-files ./example.so,./libPALISADEcore.so,./libPALISADEpke.so




from __future__ import print_function
from itertools import islice

from functools import reduce

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

import mysql.connector as mysql

# import fhe

import fhe

# pubkey = fhe.stringToPubkey(SparkFiles.get('pubkey.txt'))
# queryCtextBits = SparkFiles.get('query.txt')
# SparkFiles.get('cc.txt')


negOneVal   = -1
oneVal      = 1


dbpass = ""
# from pyspark.sql.functions import *

# # dBKeyBitsAndValues 	= [[keyOneBits,keyOneValue], [keyTwoBits,keyTwoValue], [keyThreeBits,keyThreeValue], [keyFourBits,keyFourValue]]

# # oneVal = 1

# # negOneVal = -1



# # serialized = example.Serialized()
# # example.ReadSerializationFromFile(SparkFiles.get('cryptocontext.cc'), serialized)
# # cryptoContext = example.CryptoContextFactory.DeserializeAndCreateContext(serialized, False)


mydb = mysql.connect(
  host="localhost",
  user="root",
  passwd=dbpass,
  database="test_spark_fhe_test"
)


cursor = mydb.cursor()

userId  = 1
colId   = 1
ccId    = 1
keyId   = 1
queryId = 1

# """SELECT

# create table user_queries (
#     `query_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
#     `user_id`  INT NOT NULL,
#     `collection_id`     int UNSIGNED not null, -- not necessary
#     `cryptocontext_id`  int UNSIGNED not null, -- not necessary
#     `keypair_id`        int UNSIGNED not null, -- not necessary
#     `created_time`  timestamp,
#     PRIMARY KEY(`query_id`)
# );

# create table user_query_bits (
#     `query_id` INT UNSIGNED NOT NULL,
#     `bit_id`   INT UNSIGNED NOT NULL,
#     `bit_data` LONGBLOB NOT NULL,
#     `user_id`  INT NOT NULL,
#     `collection_id`     int UNSIGNED not null,
#     `cryptocontext_id`  int UNSIGNED not null,
#     `keypair_id`        int UNSIGNED not null,
#     `created_time`  timestamp,
#     PRIMARY KEY(`query_id`, `bit_id`),
#     KEY(`user_id`, `query_id`)
# );
# """
numBits = 2

cursor.callproc("getCryptoContext",[userId,ccId])
mydb.commit()
ccRet = next(cursor.stored_results()).fetchall()[0][0]



cryptoContext = fhe.stringToCryptoContext(ccRet)

# sys.exit()

cursor.callproc("getPublicKey",[userId,ccId,keyId])
publicKeyRet = next(cursor.stored_results()).fetchall()[0][0]
publicKey = fhe.stringToPubKey(cryptoContext, publicKeyRet)

cursor.callproc("getQueryBits",[userId,queryId])
queryKeyBits = []
# print(cryptoContext)
# sys.exit()
# print(cursor.fetchall())
for allres in cursor.stored_results():
    for res in allres.fetchall():
        queryKeyBits.append(fhe.stringToCtext(cryptoContext, res[1]))

# queryKeyBits = [ fhe.stringToCtext(cryptoContext, bitres.fetchall()[1][1]) for bitres in cursor.stored_results()]
# i = 1
# for bitres in cursor.stored_results():
#     # print(bitres.fetchall()[1])
#     val = bitres.fetchall()[1]
#     print(val[1])
#     print("AAAA")
#     fp = open('file_'+str(i)+".txt", "w+")
#     fp.write(val[1])
#     fp.close()
#     i+=1
    # queryKeyBits.append( bitres.fetchall()[1]
# print(queryKeyBits)
# sys.exit()

# queryKeyBits = res[0].map(lambda row: fhe.stringToCtext(cryptoContext, row['bit_data']))


cursor.callproc("getPrivateKey",[userId,ccId,keyId])
mydb.commit()
privKeyRet = next(cursor.stored_results()).fetchall()[0][0]
privateKey = fhe.stringToPrivKey(cryptoContext, privKeyRet)



oneVal      = fhe.encryptIntPlaintext(cryptoContext, publicKey, 1)[0]
zeroVal     = fhe.encryptIntPlaintext(cryptoContext, publicKey, 0)[0]
# twoVal      = cryptoContext.EvalAdd(oneVal, oneVal)
# threeVal    = cryptoContext.EvalAdd(twoVal, oneVal)
# sixVal      = mult(twoVal, threeVal)

# six = fhe.decryptIntPlaintext(cryptoContext, privateKey, sixVal)[0]
# print(six)
# print("the siiiiiiz")
negOneVal = cryptoContext.EvalSub(zeroVal, oneVal)

print("1\n\n\n\n\n\n\n")

def buildSingleBitSubQuery(userId, colId, ccId, keyId, bit):
    return """(
    SELECT ctext_key_bit_data,
    kv_pair_id
    from user_ciphertext_keys_bitwise
    where bit_id = %d
    and   user_ciphertext_keys_bitwise.user_id            = %d
    and   user_ciphertext_keys_bitwise.collection_id      = %d
    and   user_ciphertext_keys_bitwise.cryptocontext_id   = %d
    and   user_ciphertext_keys_bitwise.keypair_id         = %d
    )as uckb_%d\n""" % (bit, userId, colId, ccId, keyId, bit)

def buildFullQuery(userId, colId, ccId, keyId, numBits):

    return """SELECT user_ciphertext_values.ctext_value_data as cvd,
    """+(",\n".join(["uckb_"+str(bit)+".ctext_key_bit_data as b_"+str(bit) for bit in range(numBits)]))\
    +"""\nfrom user_ciphertext_values 
    left join\n"""\
    +("\nleft join\n".join([buildSingleBitSubQuery(userId, colId, ccId, keyId, bit)+"\non uckb_%d.kv_pair_id = user_ciphertext_values.kv_pair_id"%(bit) for bit in range(numBits)]))\
    +"""\nwhere user_ciphertext_values.user_id      = %d
    and   user_ciphertext_values.collection_id      = %d
    and   user_ciphertext_values.cryptocontext_id   = %d
    and   user_ciphertext_values.keypair_id         = %d""" %( userId, colId, ccId, keyId)


print(buildFullQuery(userId, colId, ccId, keyId, numBits))

print("2\n\n\n\n\n\n\n")




def add(one, two):
    return cryptoContext.EvalAdd(one, two)

def mult(one, two):
    # print("one")
    # print(one)
    # print("two")
    # print(two)
    return cryptoContext.EvalMult(one, two)

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
    # for bit in queryKeyBits:
    #     bitdec = fhe.decryptIntPlaintext(cryptoContext, privateKey, bit)
    #     print("query bit was "+str(bitdec[0]))

    zippedBits = zip(dbKeyBits, queryKeyBits)
    # binaryXnoredBits = map(lambda x: doBinaryXnorBit(x[0],x[1]), zippedBits)
    # for bit in binaryXnoredBits:
    #     binaryXnoredBitsDec = fhe.decryptIntPlaintext(cryptoContext, privateKey, bit)
    #     print("binaryXnoredBitsDec was "+str(binaryXnoredBitsDec[0]))
    # print(binaryXnoredBits)
    val = reduce(mult, map(lambda x: doBinaryXnorBit(x[0],x[1]), zippedBits))
    valdec = fhe.decryptIntPlaintext(cryptoContext, privateKey, val)
    print("val dec was "+str(valdec[0]))
    return val
    # def doKeyXnor(dbKeyBits):
    # return reduce(mult, map(lambda x, queryKeyBits=queryKeyBits: doBinaryXnorBit(x[0],x[1]), zip(dbKeyBits, queryKeyBits)))


def doKeyAndValueXnor(dbKeyBitsAndValue):
    keyxnorret = doKeyXnor(dbKeyBitsAndValue[1])
    keyxnordec = fhe.decryptIntPlaintext(cryptoContext, privateKey, keyxnorret)
    print("key xnor dec: "+str(keyxnordec[0]))

    keyxnorret = doKeyXnor(dbKeyBitsAndValue[1])
    valuedec = fhe.decryptIntPlaintext(cryptoContext, privateKey, dbKeyBitsAndValue[0])
    print("and value dec res "+str(valuedec[0]))
    newRes = mult(doKeyXnor(dbKeyBitsAndValue[1]), dbKeyBitsAndValue[0])
    newResDec = fhe.decryptIntPlaintext(cryptoContext, privateKey, newRes)
    print("new res dec : "+str(newResDec[0]))
    return newRes

def doAllKeyValueXnors(allDBKeyBitsAndValue):
    cur = map(doKeyAndValueXnor, allDBKeyBitsAndValue)
    return cur
    # return cur.reduce(lambda x,y: cryptoContext.EvalAdd(x, y))
    # return allDBKeyBitsAndValue.map(doKeyAndValueXnor).reduce(add)





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



# conf = SparkConf().setAppName("App")
# conf = (conf.setMaster('local[*]')
#         .set('spark.executor.memory', '4G')
#         .set('spark.driver.memory', '4G')
#         .set('spark.driver.maxResultSize', '10G'))
# sc = SparkContext(conf=conf)



query = buildFullQuery(userId, colId, ccId, keyId, numBits)
cursor.execute(query)
row = cursor.fetchone()
new_df_keybitsandvalues = []
while row is not None:
    # /
    bitsOnly = []
    for bit in row[1:]:
        if bit is not None:
            ctextBit = fhe.stringToCtext(cryptoContext, bit.decode("utf-8"))
            bitsOnly.append(ctextBit)
            bitdec = fhe.decryptIntPlaintext(cryptoContext, privateKey, ctextBit)
            print("bit was "+str(bitdec[0]))
    valueCtext = fhe.stringToCtext(cryptoContext, row[0].decode("utf-8"))

    rowAfterXnorAndMul = doKeyAndValueXnor([valueCtext, bitsOnly])

    # valuedec = fhe.decryptIntPlaintext(cryptoContext, privateKey, valueCtext)
    # print("value was "+str(valuedec[0]))

    # newRow = [valueCtext, bitsOnly]
    # keyXnor = doKeyXnor(newRow[1])

    # keyXnordec = fhe.decryptIntPlaintext(cryptoContext, privateKey, keyXnor)
    

    # rowAfterXnorAndMul = mult(keyXnor, newRow[0])

    # rowAfterXnorAndMuldec = fhe.decryptIntPlaintext(cryptoContext, privateKey, rowAfterXnorAndMul)
    # print("rowAfterXnorAndMul "+str(rowAfterXnorAndMuldec[0]))

    new_df_keybitsandvalues.append(rowAfterXnorAndMul)
    row = cursor.fetchone()

finalRow = reduce(lambda x,y: cryptoContext.EvalAdd(x, y), new_df_keybitsandvalues)
print(finalRow)
retfinal = fhe.decryptIntPlaintext(cryptoContext, privateKey, finalRow)

print("5\n\n\n\n\n\n\n")
print(retfinal)
sys.exit()



# # combine the rows into rows of (value, [bit0,bit1,..])

# new_df_keybitsandvalues = df_keybitsandvalues.rdd.map(lambda allCols: [fhe.stringToCtext(cryptoContext, allCols[0].decode("utf-8")), [fhe.stringToCtext(cryptoContext, i.decode("utf-8")) for i in allCols[1:]]])


# print("6\n\n\n\n\n\n\n")
# # new_df_keybitsandvalues_with_query = new_df_keybitsandvalues.map(lambda allCols, queryKeyBits=queryKeyBits: [allCols[0], zip(allCols[1], queryKeyBits)])




# # new_df_keybitsandvalues.toDF().show()


# print("now new new")

# print("[0,1] expect 2")
# # queryKeyBits = [0,0]
# # new_df_keybitsandvalues_with_query = new_df_keybitsandvalues.map(lambda allCols, queryKeyBits=queryKeyBits: [allCols[0], zip(allCols[1], queryKeyBits)])
# # new_df_keybitsandvalues_with_query.toDF().show()
# new_new_0 = doAllKeyValueXnors(new_df_keybitsandvalues)
# print("the new new")
# print(new_new_0)
# new_df_keybitsandvalues.take(1)
# print("the new newa")
# final_new_new_0 = new_new_0.map(lambda x: cryptoContext.EvalAdd(oneVal, x))
# print(final_new_new_0)
# # sys.exit()
# final_new_new_01 = final_new_new_0.reduce(lambda x,y: cryptoContext.EvalAdd(x, y))
# retfinal = fhe.decryptBytePlaintext(cryptoContext, privateKey, final_new_new_01)
# # print(retfinal)
# sys.exit()


# print("answer : "+str(new_new_0))


# print("[0,1] expect 2")
# queryKeyBits = [0,1]
# new_new_1 = doAllKeyValueXnors(new_df_keybitsandvalues)
# print("answer : "+str(new_new_1))


# print("[1,0] expect 3")
# queryKeyBits = [1,0]
# new_new_2 = doAllKeyValueXnors(new_df_keybitsandvalues)
# print("answer : "+str(new_new_2))


# print("[1,1] expect 4")
# queryKeyBits = [1,1]
# new_new_3 = doAllKeyValueXnors(new_df_keybitsandvalues)
# print("answer : "+str(new_new_3))


# spark.stop()



