from __future__ import print_function

import sys
import example
import hashlib

if __name__ == '__main__':
    '''
        Usage: app_client_result [database hash]
    '''

    serialized = example.Serialized()
    example.ReadSerializationFromFile('./'+sys.argv[1]+'/client/cryptocontext.cc', serialized)
    cryptoContext = example.CryptoContextFactory.DeserializeAndCreateContext(serialized, False)

    example.ReadSerializationFromFile('./'+sys.argv[1]+'/client/key.sec', serialized)
    secKey = cryptoContext.deserializeSecretKey(serialized)

    example.ReadSerializationFromFile('./'+sys.argv[1]+'/client/result.enc', serialized)
    ciphertext = cryptoContext.deserializeCiphertext(serialized)
    ciphertext = [ciphertext]

    plaintextDec = example.IntPlaintextEncoding([])
    decryptResult = cryptoContext.Decrypt(secKey, ciphertext, plaintextDec, True)
    plaintextDec = example.decodeInts(plaintextDec)
    plaintextDec = plaintextDec[:decryptResult.messageLength]
    print(all(v == 0 for v in plaintextDec))
