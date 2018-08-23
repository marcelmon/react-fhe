
from __future__ import print_function
from itertools import islice

from functools import reduce



import sys


import mysql.connector as mysql

# import fhe

import fhe



# queryKeyBits = -1

class XnorSearch(object):

    mydb            = None
    cursor          = None
    cryptoContext   = None
    publicKey       = None
    queryKeyBits    = None
    oneVal          = None
    zeroVal         = None
    negOneVal       = None

    """docstring for XnorSearch"""
    def __init__(self):
        super(XnorSearch, self).__init__()
        # self.arg = arg
    

    def buildSingleBitSubQuery(self, userId, colId, ccId, keyId, bit):
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

    def buildFullQuery(self, userId, colId, ccId, keyId, numBits):

        return """SELECT user_ciphertext_values.ctext_value_data as cvd,
        """+(",\n".join(["uckb_"+str(bit)+".ctext_key_bit_data as b_"+str(bit) for bit in range(numBits)]))\
        +"""\nfrom user_ciphertext_values 
        left join\n"""\
        +("\nleft join\n".join([self.buildSingleBitSubQuery(userId, colId, ccId, keyId, bit)+"\non uckb_%d.kv_pair_id = user_ciphertext_values.kv_pair_id"%(bit) for bit in range(numBits)]))\
        +"""\nwhere user_ciphertext_values.user_id      = %d
        and   user_ciphertext_values.collection_id      = %d
        and   user_ciphertext_values.cryptocontext_id   = %d
        and   user_ciphertext_values.keypair_id         = %d""" %( userId, colId, ccId, keyId)


    def add(self, one, two):
        return self.cryptoContext.EvalAdd(one, two)

    def mult(self, one, two):
        return self.cryptoContext.EvalMult(one, two)

    def sub(self, one, two):
        return self.add(one, (self.mult(two, self.negOneVal)))

    def doBinaryXnorBit(self, dbBit, queryBit):

        # A' = A - 1
        # B' = B - 1
        dbBitMinus1     = self.sub(dbBit, self.oneVal)
        queryBitMinus1  = self.sub(queryBit, self.oneVal)

        # C = (A x B)+(A' x B')
        xnorLeftResult  = self.mult(dbBit, queryBit)
        xnorrightResult = self.mult(dbBitMinus1, queryBitMinus1)

        xnorResultBoth  = self.add(xnorLeftResult, xnorrightResult)

        return xnorResultBoth

    def doKeyXnor(self, dbKeyBits):
        return reduce(self.mult, map(lambda x: self.doBinaryXnorBit(x[0],x[1]), zip(dbKeyBits, self.queryKeyBits)))

    def doKeyAndValueXnor(self, dbKeyBitsAndValue):
        return self.mult(self.doKeyXnor(dbKeyBitsAndValue[1]), dbKeyBitsAndValue[0])

    def doAllKeyValueXnors(self, allDBKeyBitsAndValue):
        return map(self.doKeyAndValueXnor, allDBKeyBitsAndValue)

    def getCryptoContext(self, userId, ccId):
        self.cursor.callproc("getCryptoContext",[userId,ccId])
        self.mydb.commit()
        ccRet = next(self.cursor.stored_results()).fetchall()[0][0]
        return fhe.stringToCryptoContext(ccRet)

    def getPublicKey(self, userId,ccId,keyId):
        self.cursor.callproc("getPublicKey",[userId,ccId,keyId])
        publicKeyRet = next(self.cursor.stored_results()).fetchall()[0][0]
        return fhe.stringToPubKey(self.cryptoContext, publicKeyRet)

    def getQueryKeyBits(self):
        self.cursor.callproc("getQueryBits",[userId,queryId])
        queryKeyBits = []
        for allres in self.cursor.stored_results():
            row = allres.fetchone()
            while row is not None:
                queryKeyBits.append(fhe.stringToCtext(self.cryptoContext, row[1]))
                row = allres.fetchone()
        return queryKeyBits

    def doXnorSearch(self, dbHost, dbUser, dbPass, dbDatabase, userId, colId, ccId, keyId, queryId, numBits):
        self.mydb = mysql.connect(
          host=dbHost,
          user=dbUser,
          passwd=dbPass,
          database=dbDatabase
        )

        self.cursor = self.mydb.cursor()

        self.cryptoContext  = self.getCryptoContext(userId, ccId)
        self.publicKey      = self.getPublicKey(userId,ccId,keyId)
        self.queryKeyBits   = self.getQueryKeyBits()

        self.oneVal     = fhe.encryptIntPlaintext(self.cryptoContext, self.publicKey, 1)[0]
        self.zeroVal    = fhe.encryptIntPlaintext(self.cryptoContext, self.publicKey, 0)[0]
        self.negOneVal  = self.cryptoContext.EvalSub(self.zeroVal, self.oneVal)


        retfinal = None

        query = self.buildFullQuery(userId, colId, ccId, keyId, numBits)
        self.cursor.execute(query)
        row = self.cursor.fetchone()

        while row is not None:
            # /
            bitsOnly = [fhe.stringToCtext(self.cryptoContext, bit.decode("utf-8")) for bit in row[1:]]
            valueCtext = fhe.stringToCtext(self.cryptoContext, row[0].decode("utf-8"))

            kvXnored = self.doKeyAndValueXnor([valueCtext, bitsOnly])

            if retfinal is None:
                retfinal = kvXnored
            else:
                retfinal = self.cryptoContext.EvalAdd(retfinal, kvXnored)
            row = self.cursor.fetchone()

        self.cursor.close()
        self.mydb.close()

        return retfinal

        # retfinaldec = fhe.decryptIntPlaintext(cryptoContext, privateKey, retfinal)

        # print(retfinaldec)
        # sys.exit()
if __name__ == '__main__':
    print("running tests")
    userId  = 1
    colId   = 1
    ccId    = 1
    keyId   = 1
    queryId = 1

    numBits = 2


    dbHost = "localhost"
    dbUser = "root"
    dbPass = ""
    dbDatabase = "test_spark_fhe_test"


    xnorSearch = XnorSearch()

                                       # dbHost, dbUser, dbPass, dbDatabase, userId, colId, ccId, keyId, queryId, numBits

    retfinal = xnorSearch.doXnorSearch(dbHost, dbUser, dbPass, dbDatabase, userId, colId, ccId, keyId, queryId, numBits)





    mydb = mysql.connect(
      host=dbHost,
      user=dbUser,
      passwd=dbPass,
      database=dbDatabase
    )

    cursor = mydb.cursor()

    cursor.callproc("getPrivateKey",[userId,ccId,keyId])
    mydb.commit()
    privKeyRet = next(cursor.stored_results()).fetchall()[0][0]
    privateKey = fhe.stringToPrivKey(xnorSearch.cryptoContext, privKeyRet)


    retfinaldec = fhe.decryptIntPlaintext(xnorSearch.cryptoContext, privateKey, retfinal)
    print(retfinaldec)
    cursor.close()
    mydb.close()
    sys.exit()




# negOneVal   = -1
# oneVal      = 1






    


# cursor = mydb.cursor()

# userId  = 1
# colId   = 1
# ccId    = 1
# keyId   = 1
# queryId = 1

# numBits = 2

# cursor.callproc("getCryptoContext",[userId,ccId])
# mydb.commit()
# ccRet = next(cursor.stored_results()).fetchall()[0][0]



# cryptoContext = fhe.stringToCryptoContext(ccRet)


# cursor.callproc("getPublicKey",[userId,ccId,keyId])
# publicKeyRet = next(cursor.stored_results()).fetchall()[0][0]
# publicKey = fhe.stringToPubKey(cryptoContext, publicKeyRet)


# cursor.callproc("getQueryBits",[userId,queryId])
# queryKeyBits = []

# for allres in cursor.stored_results():
#     for res in allres.fetchall():
#         queryKeyBits.append(fhe.stringToCtext(cryptoContext, res[1]))

# cursor.callproc("getPrivateKey",[userId,ccId,keyId])
# mydb.commit()
# privKeyRet = next(cursor.stored_results()).fetchall()[0][0]
# privateKey = fhe.stringToPrivKey(cryptoContext, privKeyRet)



# oneVal      = fhe.encryptIntPlaintext(cryptoContext, publicKey, 1)[0]
# zeroVal     = fhe.encryptIntPlaintext(cryptoContext, publicKey, 0)[0]
# negOneVal = cryptoContext.EvalSub(zeroVal, oneVal)

# def buildSingleBitSubQuery(userId, colId, ccId, keyId, bit):
#     return """(
#     SELECT ctext_key_bit_data,
#     kv_pair_id
#     from user_ciphertext_keys_bitwise
#     where bit_id = %d
#     and   user_ciphertext_keys_bitwise.user_id            = %d
#     and   user_ciphertext_keys_bitwise.collection_id      = %d
#     and   user_ciphertext_keys_bitwise.cryptocontext_id   = %d
#     and   user_ciphertext_keys_bitwise.keypair_id         = %d
#     )as uckb_%d\n""" % (bit, userId, colId, ccId, keyId, bit)

# def buildFullQuery(userId, colId, ccId, keyId, numBits):

#     return """SELECT user_ciphertext_values.ctext_value_data as cvd,
#     """+(",\n".join(["uckb_"+str(bit)+".ctext_key_bit_data as b_"+str(bit) for bit in range(numBits)]))\
#     +"""\nfrom user_ciphertext_values 
#     left join\n"""\
#     +("\nleft join\n".join([buildSingleBitSubQuery(userId, colId, ccId, keyId, bit)+"\non uckb_%d.kv_pair_id = user_ciphertext_values.kv_pair_id"%(bit) for bit in range(numBits)]))\
#     +"""\nwhere user_ciphertext_values.user_id      = %d
#     and   user_ciphertext_values.collection_id      = %d
#     and   user_ciphertext_values.cryptocontext_id   = %d
#     and   user_ciphertext_values.keypair_id         = %d""" %( userId, colId, ccId, keyId)


# def add(one, two):
#     return cryptoContext.EvalAdd(one, two)

# def mult(one, two):
#     return cryptoContext.EvalMult(one, two)

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
#     return reduce(mult, map(lambda x: doBinaryXnorBit(x[0],x[1]), zip(dbKeyBits, queryKeyBits)))

# def doKeyAndValueXnor(dbKeyBitsAndValue):
#     print("kv snor")
#     return mult(doKeyXnor(dbKeyBitsAndValue[1]), dbKeyBitsAndValue[0])

# def doAllKeyValueXnors(allDBKeyBitsAndValue):
#     return map(doKeyAndValueXnor, allDBKeyBitsAndValue)



# retfinal = None

# query = buildFullQuery(userId, colId, ccId, keyId, numBits)
# cursor.execute(query)
# row = cursor.fetchone()

# while row is not None:
#     # /
#     bitsOnly = [fhe.stringToCtext(cryptoContext, bit.decode("utf-8")) for bit in row[1:]]
#     valueCtext = fhe.stringToCtext(cryptoContext, row[0].decode("utf-8"))

#     kvXnored = doKeyAndValueXnor([valueCtext, bitsOnly])

#     if retfinal is None:
#         retfinal = kvXnored
#     else:
#         retfinal = cryptoContext.EvalAdd(retfinal, kvXnored)
#     row = cursor.fetchone()



# retfinaldec = fhe.decryptIntPlaintext(cryptoContext, privateKey, retfinal)

# print(retfinaldec)
# sys.exit()
