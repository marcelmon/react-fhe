from __future__ import print_function
from itertools import islice

import sys
import os
import time
import example
import pathlib
import hashlib
import shutil

if __name__ == '__main__':
    '''
        Usage: app_bootstrap [number of words to encrypt]
    '''

    numWords = int(sys.argv[1])
    if numWords < 1 or numWords > 100:
        print('Bad number of words!')
        sys.exit(-1)

    print('Generating crypto context with p = 256...')
    cryptoContext = example.CryptoContextFactory.genCryptoContextFV(256, 1.006, 1, 4.0, 0, 2, 0, example.MODE.OPTIMIZED)
    cryptoContext.Enable(example.PKESchemeFeature.ENCRYPTION)
    cryptoContext.Enable(example.PKESchemeFeature.SHE)

    print('Generating keypair...')
    keyPair = cryptoContext.KeyGen()
    cryptoContext.EvalMultKeyGen(keyPair.secretKey)

    # Use public key hash as directory name
    serialized = example.Serialized()
    keyPair.publicKey.Serialize(serialized)

    m = hashlib.sha1()
    pubKey = example.SerializationToString(serialized, '')[1]
    m.update(pubKey.encode('utf-8'))
    dirName = m.hexdigest()[:3]
    pathlib.Path('./'+dirName+'/client').mkdir(parents=True, exist_ok=True) 
    pathlib.Path('./'+dirName+'/server').mkdir(parents=True, exist_ok=True) 
    print('Created directories client and server in '+dirName+'...')

    print('Serializing cryptocontext and keypair to client dir...')
    cryptoContext.Serialize(serialized)
    example.WriteSerializationToFile(serialized, './'+dirName+'/client/cryptocontext.cc')
    keyPair.secretKey.Serialize(serialized)
    example.WriteSerializationToFile(serialized, './'+dirName+'/client/key.sec')
    keyPair.publicKey.Serialize(serialized)
    example.WriteSerializationToFile(serialized, './'+dirName+'/client/key.pub')
    shutil.copyfile('./example.so', './'+dirName+'/client/example.so')

    serializedStrings = []
    try:
        with open('./words_alpha.txt', 'r') as f:
            words = f.readlines()
    except OSError:
        print('Cannot open word list')
    else:
        for word in islice(words, 0, numWords):
            word = word.strip()
            plaintext = word.strip()
            print('Encrypting', plaintext, '...')
            plaintext = example.BytePlaintextEncoding(plaintext)
            ciphertext = cryptoContext.Encrypt(keyPair.publicKey, plaintext, True, True)
            end = time.time()

            print('Serializing ciphertext to server dir...')
            serialized = example.Serialized()
            ciphertext[0].Serialize(serialized)
            example.WriteSerializationToFile(serialized, './'+dirName+'/server/'+word+'.enc')

            if 'CASSANDRA' in os.environ or 'POSTGRES' in os.environ:
                serializedStrings.append(example.SerializationToString(serialized, '')[1])

    if 'CASSANDRA' in os.environ:
        from cassandra.cluster import Cluster
        cluster = Cluster()
        # assume keyspace 'test' exists https://github.com/datastax/spark-cassandra-connector/blob/master/doc/2_loading.md#example-of-loading-an-rdd-from-cassandra
        session = cluster.connect('test')
        tableName = 'spark'+dirName
        session.execute(
                """
                CREATE TABLE %s (name text PRIMARY KEY, value text);
                """ % tableName)
        for i, string in zip(range(0, numWords), serializedStrings):
            session.execute(
                    """
                    INSERT INTO %s (name, value)
                    VALUES ('%s', '%s')
                    """ % (tableName, str(i), string))
    elif 'POSTGRES' in os.environ:
        import psycopg2
        conn = psycopg2.connect("dbname=test user=postgres")
        cur = conn.cursor()
        tableName = 'spark'+dirName
        cur.execute(
                """
                CREATE TABLE %s (name text PRIMARY KEY, value text);
                """ % tableName)
        for i, string in zip(range(0, numWords), serializedStrings):
            cur.execute(
                    """
                    INSERT INTO %s (name, value)
                    VALUES ('%s', '%s')
                    """ % (tableName, str(i), string))
        cur.execute("SELECT * FROM %s;" % tableName)
        conn.commit()
        cur.close()
        conn.close()

    print('Decrypting...')
    serialized = example.Serialized()
    example.ReadSerializationFromFile('./'+dirName+'/server/a.enc', serialized)
    ciphertext = cryptoContext.deserializeCiphertext(serialized)
    ciphertext = [ciphertext]
    plaintextDec = example.BytePlaintextEncoding('')
    cryptoContext.Decrypt(keyPair.secretKey, ciphertext, plaintextDec, True)
    plaintextDec = example.decodeBytes(plaintextDec)
    print('"'+plaintextDec+'" should be "a"')
