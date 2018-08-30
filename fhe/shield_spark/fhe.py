import sys as sys
import os
sys.path.append(os.path.realpath(__file__)+"/../")
import example as fhe

import json as json

# import base64

# cryptoContextOneFileName 	= "cryptocontext1.txt"
# cryptoContextFinalFileName 	= "cryptocontext.txt"

# ctextFileName 	= "ctext.txt"
# privKeyFileName = "privKey.txt"
# pubKeyFileName 	= "pubKey.txt"




# """
# consider compressing some data
# operations:
# 	cryptocontext
# 		function:
# 			generate cc
# 		params
# 			can provide data destination
# 		return
# 			file name, or data

# 	keygen
# 		function: 
# 			generate pub/priv keys and evalmult keys
# 			also re-serialize cc if necessary
# 		params
# 			cc (serialized data or file location)
# 			is EvalMultKeyGen?
# 		return
# 			new cc location or data
# 			priv key data or location
# 			pub key data or location
# 	encrypt
# 	decrypt
# 	evalmult
# 	evaladd


# """
def stringToCryptoContext(serializedCCString):
	return fhe.deserializeCryptoContext(serializedCCString)

def stringToCtext(cryptoContext, serializedCiphertextString):
	return fhe.deserializeCiphertext(cryptoContext, serializedCiphertextString)

def stringToPubKey(cryptoContext, serializedPublicKeyString):
	return fhe.deserializePublicKey(cryptoContext, serializedPublicKeyString)

def stringToPrivKey(cryptoContext, serializedPrivateKeyString):	
	return fhe.deserializePrivateKey(cryptoContext, serializedPrivateKeyString)

def getCtextMatrixSample(ctext, numElements = 1, numCoefficients = 1):
	return fhe.getCtextMatrixSample(ctext, numElements, numCoefficients)

def getCtextMatrixSampleFromSerialized(serializedCCString, serializedCiphertextString, numElements = 1, numCoefficients = 1):
	cryptoContext = stringToCryptoContext(serializedCCString)
	ciphertext 			= stringToCtext(serializedCiphertextString)
	return getCtextMatrixSample(ciphertext, numElements, numCoefficients)

def buildCryptoContext():
	return fhe.generateCC()

def keygen(cryptoContext):
	return fhe.generateKeys(cryptoContext)

def encryptBytePlaintext(cryptoContext, publicKey, plaintext):
	return fhe.encryptBytes(cryptoContext, publicKey, plaintext)

def decryptBytePlaintext(cryptoContext, privateKey, ciphertext):
	return fhe.decryptString(cryptoContext, privateKey, ciphertext)

def encryptIntPlaintext(cryptoContext, publicKey, plaintext):
	return fhe.encryptInt(cryptoContext, publicKey, plaintext)

def decryptIntPlaintext(cryptoContext, privateKey, ciphertext):
	return fhe.decryptInt(cryptoContext, privateKey, ciphertext)

def generateCryptoContextToStringSerialization():
	cryptoContext = buildCryptoContext()
	retString = fhe.serializeCC(cryptoContext)
	return retString

def keygenToStringSerialization(serializedCCString):

	cryptoContext = stringToCryptoContext(serializedCCString)
	keyPair 	= keygen(cryptoContext)

	publicKey 	= fhe.getPublicKey(keyPair)
	privateKey 	= fhe.getPrivateKey(keyPair)

	newSerializedCryptoContextString = fhe.serializeCC(cryptoContext)
	serializedPublicKeyString 	= fhe.serializePublicKey(publicKey)
	serializedPrivateKeyString 	= fhe.serializePrivateKey(privateKey)

	returnDict = {}

	returnDict['cryptocontext'] = newSerializedCryptoContextString
	returnDict['publickey'] 	= serializedPublicKeyString
	returnDict['privatekey'] 	= serializedPrivateKeyString

	return returnDict

def encryptToStringSerialization(serializedCCString, serializedPublicKeyString, plaintext, includeSampleData = False):

	cryptoContext = stringToCryptoContext(serializedCCString)
	publicKey 	= fhe.deserializePublicKey(cryptoContext, serializedPublicKeyString)
	ciphertext 	= encryptBytePlaintext(cryptoContext, publicKey, plaintext)
	serializedCiphertextString 	= fhe.serializeCiphertext(ciphertext)
	if includeSampleData:
		numElements = 2
		numCoefficients = 3
		return { 'ctext': serializedCiphertextString, 'sample': getCtextMatrixSample(ciphertext, numElements, numCoefficients) }
	else:
		return serializedCiphertextString

def encryptIntToStringSerialization(serializedCCString, serializedPublicKeyString, plaintext, includeSampleData = False):
		
	cryptoContext = stringToCryptoContext(serializedCCString)
	publicKey 	= fhe.deserializePublicKey(cryptoContext, serializedPublicKeyString)
	ciphertext 	= encryptIntPlaintext(cryptoContext, publicKey, plaintext)
	serializedCiphertextString 	= fhe.serializeCiphertext(ciphertext)
	if includeSampleData:
		numElements = 2
		numCoefficients = 3
		return { 'ctext': serializedCiphertextString, 'sample': getCtextMatrixSample(ciphertext, numElements, numCoefficients) }
	else:
		return serializedCiphertextString
	


def decryptToStringSerialization(serializedCCString, serializedPrivateKeyString, serializedCiphertextString):
	cryptoContext = stringToCryptoContext(serializedCCString)
	privateKey 	= fhe.deserializePrivateKey(cryptoContext, serializedPrivateKeyString)
	ciphertext 	= fhe.deserializeCiphertext(cryptoContext, serializedCiphertextString)
	plaintext 	= decryptBytePlaintext(cryptoContext, privateKey, ciphertext)

	return plaintext


def decryptIntToStringSerialization(serializedCCString, serializedPrivateKeyString, serializedCiphertextString):
	cryptoContext = stringToCryptoContext(serializedCCString)
	privateKey 	= fhe.deserializePrivateKey(cryptoContext, serializedPrivateKeyString)
	ciphertext 	= fhe.deserializeCiphertext(cryptoContext, serializedCiphertextString)
	plaintext 	= decryptIntPlaintext(cryptoContext, privateKey, ciphertext)
	return plaintext
