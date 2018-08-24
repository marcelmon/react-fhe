import mysql.connector as mysql
import fhe
import sys
import os



dbpass =""
mydb = mysql.connect(
  host="localhost",
  user="root",
  passwd=dbpass
)

db = "test_spark_fhe_test"

mycursor = mydb.cursor()

drop = "drop DATABASE if exists %s"%db
print(drop)
mycursor.execute(drop)
print("1")
mydb.commit()
print("2")

create = "create database %s"%db
print(create)
mycursor.execute(create)
mydb.commit()
mycursor.close()
mydb.close()


mydb = mysql.connect(
  host="localhost",
  user="root",
  passwd=dbpass,
  database="test_spark_fhe_test"
)
mycursor = mydb.cursor()
fp = open("../../node-server-app/user_data_database.sql");
createStatement = fp.read()
# print(createStatement)

fp.close()
# # sys.exit()



createTestDatabseTables = """mysql -u root -p'StupidPaSs*%' test_spark_fhe_test < ../../node-server-app/user_data_database.sql"""
# print(createTestDatabseTables)
os.system(createTestDatabseTables)

# mycursor.execute(createStatement)
# mydb.commit()
# sys.exit()

userId 			= 1
ccId 			= 1
keypairId 		= 1
collectionId 	= 1



ccData = fhe.generateCryptoContextToStringSerialization()

keypairAndCC = fhe.keygenToStringSerialization(ccData)

ccData		=keypairAndCC['cryptocontext']
publickey 	=keypairAndCC['publickey']
privatekey 	=keypairAndCC['privatekey']

mycursor.callproc("putCryptoContext", [ccData, userId, ccId])
mycursor.callproc("putKeypair", [publickey, privatekey, userId, ccId, keypairId])
mydb.commit()

key_1_bit_1 = 0
key_1_bit_2 = 0
value_1 	= 1

encrypted_key_1_bit_1 	= fhe.encryptIntToStringSerialization(ccData, publickey, key_1_bit_1)
encrypted_key_1_bit_2 	= fhe.encryptIntToStringSerialization(ccData, publickey, key_1_bit_2)
encrypted_value_1 		= fhe.encryptIntToStringSerialization(ccData, publickey, value_1)

mycursor.callproc("putCiphertextValueData", [encrypted_value_1, userId, collectionId, ccId, keypairId, 1])
mycursor.callproc("putCiphertextKeyBitData", [encrypted_key_1_bit_1, userId, collectionId, ccId, keypairId, 1, 0])
mycursor.callproc("putCiphertextKeyBitData", [encrypted_key_1_bit_2, userId, collectionId, ccId, keypairId, 1, 1])
mydb.commit()


key_2_bit_1 = 0
key_2_bit_2 = 1
value_2 	= 2

encrypted_key_2_bit_1 	= fhe.encryptIntToStringSerialization(ccData, publickey, key_2_bit_1)
encrypted_key_2_bit_2 	= fhe.encryptIntToStringSerialization(ccData, publickey, key_2_bit_2)
encrypted_value_2 		= fhe.encryptIntToStringSerialization(ccData, publickey, value_2)

mycursor.callproc("putCiphertextValueData", [encrypted_value_2, userId, collectionId, ccId, keypairId, 2])
mycursor.callproc("putCiphertextKeyBitData", [encrypted_key_2_bit_1, userId, collectionId, ccId, keypairId, 2, 0])
mycursor.callproc("putCiphertextKeyBitData", [encrypted_key_2_bit_2, userId, collectionId, ccId, keypairId, 2, 1])

mydb.commit()




key_3_bit_1 = 1
key_3_bit_2 = 0
value_3 	= 3

encrypted_key_3_bit_1 	= fhe.encryptIntToStringSerialization(ccData, publickey, key_3_bit_1)
encrypted_key_3_bit_2 	= fhe.encryptIntToStringSerialization(ccData, publickey, key_3_bit_2)
encrypted_value_3 		= fhe.encryptIntToStringSerialization(ccData, publickey, value_3)


mycursor.callproc("putCiphertextValueData", [encrypted_value_3, userId, collectionId, ccId, keypairId, 3])
mycursor.callproc("putCiphertextKeyBitData", [encrypted_key_3_bit_1, userId, collectionId, ccId, keypairId, 3, 0])
mycursor.callproc("putCiphertextKeyBitData", [encrypted_key_3_bit_2, userId, collectionId, ccId, keypairId, 3, 1])

mydb.commit()




key_4_bit_1 = 1
key_4_bit_2 = 1
value_4 	= 4

encrypted_key_4_bit_1 	= fhe.encryptIntToStringSerialization(ccData, publickey, key_4_bit_1)
encrypted_key_4_bit_2 	= fhe.encryptIntToStringSerialization(ccData, publickey, key_4_bit_2)
encrypted_value_4 		= fhe.encryptIntToStringSerialization(ccData, publickey, value_4)

mycursor.callproc("putCiphertextValueData", [encrypted_value_4, userId, collectionId, ccId, keypairId, 4])
mycursor.callproc("putCiphertextKeyBitData", [encrypted_key_4_bit_1, userId, collectionId, ccId, keypairId, 4, 0])
mycursor.callproc("putCiphertextKeyBitData", [encrypted_key_4_bit_2, userId, collectionId, ccId, keypairId, 4, 1])

mydb.commit()



queryId = 1
queryBit1 = 0
queryBit2 = 1

encQBit1 = fhe.encryptIntToStringSerialization(ccData, publickey, queryBit1)
encQBit2 = fhe.encryptIntToStringSerialization(ccData, publickey, queryBit2)

mycursor.callproc("putQuery", [queryId, userId])
mycursor.callproc("putQueryBitData", [queryId, userId, 1, encQBit1])
mycursor.callproc("putQueryBitData", [queryId, userId, 2, encQBit2])

mydb.commit()

mycursor.close()
mydb.close()