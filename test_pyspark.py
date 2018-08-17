# spark-submit /var/www/html/FHSearch/test_pyspark.py --jars /home/marcel/spark/mysql-connector-java-8.0.12/mysql-connector-java-8.0.12.jar --driver-class-path=/home/marcel/spark/mysql-connector-java-8.0.12/mysql-connector-java-8.0.12.jar


#spark-submit /var/www/html/FHSearch/test_pyspark.py --packages mysql:mysql-connector-java:8.0.12

#spark-submit /var/www/html/FHSearch/test_pyspark.py --jars /home/marcel/spark/mysql-connector-java-8.0.12/mysql-connector-java-8.0.12.jar --driver-class-path=/home/marcel/spark/mysql-connector-java-8.0.12/mysql-connector-java-8.0.12.jar

from __future__ import print_function
from itertools import islice

# import sys
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


# from pyspark.sql.functions import *

# # dBKeyBitsAndValues 	= [[keyOneBits,keyOneValue], [keyTwoBits,keyTwoValue], [keyThreeBits,keyThreeValue], [keyFourBits,keyFourValue]]

# # oneVal = 1

# # negOneVal = -1



# # serialized = example.Serialized()
# # example.ReadSerializationFromFile(SparkFiles.get('cryptocontext.cc'), serialized)
# # cryptoContext = example.CryptoContextFactory.DeserializeAndCreateContext(serialized, False)


userId  = 665
colId   = 6
ccId    = 5
keyId   = 5
numBits = 6

def buildSingleBitSubQuery(userId, colId, ccId, keyId, bit):
    return """(
    SELECT bit_id,
    kv_pair_id
    from user_ciphertext_keys_bitwise
    where bit_id = %d
    and   user_ciphertext_keys_bitwise.user_id            = %d
    and   user_ciphertext_keys_bitwise.collection_id      = %d
    and   user_ciphertext_keys_bitwise.cryptocontext_id   = %d
    and   user_ciphertext_keys_bitwise.keypair_id         = %d
    )as uckb_%d\n""" % (bit, userId, colId, ccId, keyId, bit)

def buildFullQuery(userId, colId, ccId, keyId, numBits):

    return """SELECT user_ciphertext_values.kv_pair_id as cvd,
    user_ciphertext_values.kv_pair_id as kpi,
    """+(",\n".join(["uckb_"+str(bit)+".bit_id as b_"+str(bit) for bit in range(numBits)]))\
    +"""\nfrom user_ciphertext_values 
    left join\n"""\
    +("\nleft join\n".join([buildSingleBitSubQuery(userId, colId, ccId, keyId, bit)+"\non uckb_%d.kv_pair_id = user_ciphertext_values.kv_pair_id"%(bit) for bit in range(numBits)]))\
    +"""\nwhere user_ciphertext_values.user_id      = %d
    and   user_ciphertext_values.collection_id      = %d
    and   user_ciphertext_values.cryptocontext_id   = %d
    and   user_ciphertext_values.keypair_id         = %d""" %( userId, colId, ccId, keyId)


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
                        option("password", "").\
                        option("driver", "com.mysql.jdbc.Driver").\
                        option("dbtable", "("+buildFullQuery(userId, colId, ccId, keyId, numBits)+") as the_table").\
                        load()


# combine the rows into rows of (value, [bit0,bit1,..])

new_df_keybitsandvalues = df_keybitsandvalues.rdd.map(lambda allCols: [allCols[0], allCols[1], [i for i in allCols[2:]]])

df_keybitsandvalues.show()

# import functions.*

from pyspark.sql.functions import udf, col


new_df_keybitsandvalues = df_keybitsandvalues.rdd.map(lambda allCols: [allCols[0], allCols[1], [i for i in allCols[2:]]])

new_df_keybitsandvalues.toDF().show()

# new_df_keybitsandvalues = df_keybitsandvalues.select(col("cvd"), mergeCols(col(4), col(5)))

# # new_df_keybitsandvalues = df_keybitsandvalues.withColumn("Food", mergeCols(col("b_0"), col("b_1")))

# new_df_keybitsandvalues.show()