import sys as sys
import os
sys.path.append(os.path.realpath(__file__)+"/../")
import example

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
	serializedCC = example.Serialized()
	example.StringToSerialization(serializedCCString, serializedCC)
	cryptoContext = example.CryptoContextFactory.DeserializeAndCreateContext(serializedCC, False)
	return cryptoContext

def stringToCtext(cryptoContext, serializedCiphertextString):
	serializedCiphertext = example.Serialized()
	example.StringToSerialization(serializedCiphertextString, serializedCiphertext)
	ciphertext 			= cryptoContext.deserializeCiphertext(serializedCiphertext)
	return ciphertext

def stringToPubKey(cryptoContext, serializedPublicKeyString):
	serializedPublicKey = example.Serialized()
	example.StringToSerialization(serializedPublicKeyString, serializedPublicKey)
	publicKey = cryptoContext.deserializePublicKey(serializedPublicKey)
	return publicKey

def stringToPrivKey(cryptoContext, serializedPrivateKeyString):
	serializedPrivateKey = example.Serialized()
	example.StringToSerialization(serializedPrivateKeyString, serializedPrivateKey)
	privateKey = cryptoContext.deserializeSecretKey(serializedPrivateKey)
	return privateKey

def getCtextMatrixSample(ctext, numElements = 1, numCoefficients = 1):
	return example.getCtextMatrixSample(ctext, numElements, numCoefficients)

def getCtextMatrixSampleFromSerialized(serializedCCString, serializedCiphertextString, numElements = 1, numCoefficients = 1):

	serializedCC = example.Serialized()
	example.StringToSerialization(serializedCCString, serializedCC)
	cryptoContext = example.CryptoContextFactory.DeserializeAndCreateContext(serializedCC, False)

	serializedCiphertext = example.Serialized()
	example.StringToSerialization(serializedCiphertextString, serializedCiphertext)
	ciphertext 			= cryptoContext.deserializeCiphertext(serializedCiphertext)

	return getCtextMatrixSample(ciphertext, numElements, numCoefficients)

def serializedToString(serializedObject):
	return example.SerializationToString(serializedObject, '')[1]
	
def serializeObject(objectToSerialize):
	serialized = example.Serialized()
	objectToSerialize.Serialize(serialized)
	return serialized

def stringToSerialization(serializedString):
	serialized = example.Serialized()
	example.StringToSerialization(serializedString, serialized)
	return serialized
	

def buildCryptoContext():
	# cryptoContext = example.CryptoContextFactory.genCryptoContextFV(256, 0, 1, 0, 0, 2, 0, example.MODE.OPTIMIZED)
	cryptoContext = example.genCCBV()
	# cryptoContext.Enable(example.PKESchemeFeature.ENCRYPTION)
	# cryptoContext.Enable(example.PKESchemeFeature.SHE)
	return cryptoContext

def keygen(cryptoContext):
	keyPair = cryptoContext.KeyGen()
	cryptoContext.EvalMultKeyGen(keyPair.secretKey)
	return keyPair

def encryptBytePlaintext(cryptoContext, publicKey, plaintext):
	return cryptoContext.Encrypt(publicKey, example.BytePlaintextEncoding(plaintext), True, True)


def decryptBytePlaintext(cryptoContext, privateKey, ciphertext):
	plaintextDec = example.BytePlaintextEncoding("")
	decryptResult = cryptoContext.Decrypt(privateKey, [ciphertext], plaintextDec, True)
	plaintextDec = example.decodeBytes(plaintextDec)
	plaintextDec = plaintextDec[:decryptResult.messageLength]
	return plaintextDec

def decryptIntPlaintext(cryptoContext, privateKey, ciphertext):
	plaintextDec = example.IntPlaintextEncoding([])
	decryptResult = cryptoContext.Decrypt(privateKey, [ciphertext], plaintextDec, True)
	plaintextDec = example.decodeInts(plaintextDec)
	plaintextDec = plaintextDec[:decryptResult.messageLength]
	return plaintextDec

def encryptIntPlaintext(cryptoContext, publicKey, plaintext):
	return cryptoContext.Encrypt(publicKey, example.IntPlaintextEncoding([plaintext]), True, True)

def generateCryptoContextToStringSerialization():
	cryptoContext = buildCryptoContext()

	serializedCryptoContext = example.Serialized()
	cryptoContext.Serialize(serializedCryptoContext)
	stringSerializedCC 		= example.SerializationToString(serializedCryptoContext, '')[1]

	return stringSerializedCC

def keygenToStringSerialization(serializedCCString):

	serializedCC = example.Serialized()
	example.StringToSerialization(serializedCCString, serializedCC)
	cryptoContext = example.CryptoContextFactory.DeserializeAndCreateContext(serializedCC, False)

	keyPair = cryptoContext.KeyGen()
	cryptoContext.EvalMultKeyGen(keyPair.secretKey)

	newSerializedCryptoContext 			= example.Serialized()
	cryptoContext.Serialize(newSerializedCryptoContext)
	newSerializedCryptoContextString 	= example.SerializationToString(newSerializedCryptoContext, '')[1]

	serializedPublicKey = example.Serialized()
	keyPair.publicKey.Serialize(serializedPublicKey)
	serializedPublicKeyString 	= example.SerializationToString(serializedPublicKey, '')[1]

	serializedPrivateKey = example.Serialized()
	keyPair.secretKey.Serialize(serializedPrivateKey)
	serializedPrivateKeyString 	= example.SerializationToString(serializedPrivateKey, '')[1]

	returnDict = {}

	returnDict['cryptocontext'] = newSerializedCryptoContextString
	returnDict['publickey'] 	= serializedPublicKeyString
	returnDict['privatekey'] 	= serializedPrivateKeyString

	return returnDict

def encryptToStringSerialization(serializedCCString, serializedPublicKeyString, plaintext, includeSampleData = False):
	serializedCC = example.Serialized()
	example.StringToSerialization(serializedCCString, serializedCC)
	cryptoContext = example.CryptoContextFactory.DeserializeAndCreateContext(serializedCC, False)

	serializedPublicKey = example.Serialized()
	example.StringToSerialization(serializedPublicKeyString, serializedPublicKey)
	publicKey = cryptoContext.deserializePublicKey(serializedPublicKey)

	ciphertext = encryptBytePlaintext(cryptoContext, publicKey, plaintext)

	serializedCiphertext = example.Serialized()
	ciphertext[0].Serialize(serializedCiphertext)
	serializedCiphertextString 	= example.SerializationToString(serializedCiphertext, '')[1]
	if includeSampleData:
		numElements = 2
		numCoefficients = 3
		return { 'ctext': serializedCiphertextString, 'sample': getCtextMatrixSample(ciphertext[0], numElements, numCoefficients) }
	else:
		return serializedCiphertextString

def encryptIntToStringSerialization(serializedCCString, serializedPublicKeyString, plaintext, includeSampleData = False):
	serializedCC = example.Serialized()
	example.StringToSerialization(serializedCCString, serializedCC)
	cryptoContext = example.CryptoContextFactory.DeserializeAndCreateContext(serializedCC, False)

	serializedPublicKey = example.Serialized()
	example.StringToSerialization(serializedPublicKeyString, serializedPublicKey)
	publicKey = cryptoContext.deserializePublicKey(serializedPublicKey)

	ciphertext = encryptIntPlaintext(cryptoContext, publicKey, plaintext)

	serializedCiphertext = example.Serialized()
	ciphertext[0].Serialize(serializedCiphertext)
	serializedCiphertextString 	= example.SerializationToString(serializedCiphertext, '')[1]
	if includeSampleData:
		numElements = 2
		numCoefficients = 3
		return { 'ctext': serializedCiphertextString, 'sample': getCtextMatrixSample(ciphertext[0], numElements, numCoefficients) }
	else:
		return serializedCiphertextString
	


def decryptToStringSerialization(serializedCCString, serializedPrivateKeyString, serializedCiphertextString):
	serializedCC = example.Serialized()
	example.StringToSerialization(serializedCCString, serializedCC)
	cryptoContext = example.CryptoContextFactory.DeserializeAndCreateContext(serializedCC, False)

	serializedPrivateKey = example.Serialized()
	example.StringToSerialization(serializedPrivateKeyString, serializedPrivateKey)
	privateKey = cryptoContext.deserializeSecretKey(serializedPrivateKey)

	serializedCiphertext = example.Serialized()
	example.StringToSerialization(serializedCiphertextString, serializedCiphertext)
	ciphertext 			= cryptoContext.deserializeCiphertext(serializedCiphertext)

	plaintext = decryptBytePlaintext(cryptoContext, privateKey, ciphertext)

	return plaintext


def decryptIntToStringSerialization(serializedCCString, serializedPrivateKeyString, serializedCiphertextString):
	serializedCC = example.Serialized()
	example.StringToSerialization(serializedCCString, serializedCC)
	cryptoContext = example.CryptoContextFactory.DeserializeAndCreateContext(serializedCC, False)

	serializedPrivateKey = example.Serialized()
	example.StringToSerialization(serializedPrivateKeyString, serializedPrivateKey)
	privateKey = cryptoContext.deserializeSecretKey(serializedPrivateKey)

	serializedCiphertext = example.Serialized()
	example.StringToSerialization(serializedCiphertextString, serializedCiphertext)
	ciphertext 			= cryptoContext.deserializeCiphertext(serializedCiphertext)

	plaintext = decryptIntPlaintext(cryptoContext, privateKey, ciphertext)

	return plaintext
