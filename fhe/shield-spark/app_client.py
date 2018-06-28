from __future__ import print_function

import sys
import example
import hashlib

if __name__ == '__main__':
    '''
        Usage: app_client [database hash] [query]
    '''

    serialized = example.Serialized()
    example.ReadSerializationFromFile('./'+sys.argv[1]+'/client/cryptocontext.cc', serialized)
    cryptoContext = example.CryptoContextFactory.DeserializeAndCreateContext(serialized, False)

    example.ReadSerializationFromFile('./'+sys.argv[1]+'/client/key.pub', serialized)
    pubKey = cryptoContext.deserializePublicKey(serialized)

    plaintext = sys.argv[2]
    plaintext = example.BytePlaintextEncoding(plaintext)
    ciphertext = cryptoContext.Encrypt(pubKey, plaintext, True, True)

    serialized = example.Serialized()
    ciphertext[0].Serialize(serialized)
    example.WriteSerializationToFile(serialized, './'+sys.argv[1]+'/client/query.enc')

    """ # Decrypt double check
    example.ReadSerializationFromFile('./'+sys.argv[1]+'/client/key.sec', serialized)
    secKey = cryptoContext.deserializeSecretKey(serialized)

    example.ReadSerializationFromFile('./'+sys.argv[1]+'/client/query.enc', serialized)
    ciphertext = cryptoContext.deserializeCiphertext(serialized)
    ciphertext = [ciphertext]

    plaintextDec = example.BytePlaintextEncoding('')
    cryptoContext.Decrypt(secKey, ciphertext, plaintextDec, True)
    plaintextDec = example.decodeBytes(plaintextDec)
    """

    print('spark-submit --files ./'+sys.argv[1]+'/client/key.pub,./'+sys.argv[1]+'/client/cryptocontext.cc,./'+sys.argv[1]+'/client/query.enc app_server.py')
