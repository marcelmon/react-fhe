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

    print('Generating crypto context with p = 1024...')
    cryptoContext = example.CryptoContextFactory.genCryptoContextFV(1024, 1.006, 1, 4.0, 0, 2, 0, example.MODE.OPTIMIZED)
    cryptoContext.Enable(example.PKESchemeFeature.ENCRYPTION)
    cryptoContext.Enable(example.PKESchemeFeature.SHE)

    print('Reading back generated crypto context...')
    example.printCryptoContext(cryptoContext)

    start = time.time()
    print('Generating keypair...')
    keyPair = cryptoContext.KeyGen()
    cryptoContext.EvalMultKeyGen(keyPair.secretKey)
    end = time.time()
    print('...took', end - start);

    start = time.time()
    plaintext = [3,2,1,3,2,1,0,0,0,0,0,0]
    print('Encrypting', plaintext, '...')
    plaintext = example.IntPlaintextEncoding(plaintext)
    ciphertext = cryptoContext.Encrypt(keyPair.publicKey, plaintext, True, True)
    end = time.time()
    print('...took', end - start);

    print('Serializing and deserializing ciphertext...')
    start = time.time()
    serialized = example.Serialized()
    ciphertext[0].Serialize(serialized)
    example.WriteSerializationToFile(serialized, "321321.enc")
    example.ReadSerializationFromFile("321321.enc", serialized)
    ciphertext = cryptoContext.deserializeCiphertext(serialized)
    ciphertext = [ciphertext]
    end = time.time()
    print('...took', end - start);

    start = time.time()
    print('Decrypting...')
    plaintextDec = example.IntPlaintextEncoding([])
    cryptoContext.Decrypt(keyPair.secretKey, ciphertext, plaintextDec, True)
    plaintextDec = example.decodeInts(plaintextDec)
    plaintextDec = plaintextDec[:plaintext.size()]
    end = time.time()
    print('...took', end - start, 'and got', plaintextDec);

    start = time.time()
    print('EvalMulting it with itself...')
    ciphertext = cryptoContext.EvalMult(ciphertext[0], ciphertext[0])
    plaintextDec = example.IntPlaintextEncoding([])
    cryptoContext.Decrypt(keyPair.secretKey, [ciphertext], plaintextDec, True)
    plaintextDec = example.decodeInts(plaintextDec)
    plaintextDec = plaintextDec[:plaintext.size()]
    end = time.time()
    print('...took', end - start, 'and got', plaintextDec);

    spark.stop()
