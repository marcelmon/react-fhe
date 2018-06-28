import sys as sys
import os
sys.path.append(os.path.realpath(__file__)+"/../")
import example

import json as json

import base64

cryptoContextOneFileName 	= "cryptocontext1.txt"
cryptoContextFinalFileName 	= "cryptocontext.txt"

ctextFileName 	= "ctext.txt"
privKeyFileName = "privKey.txt"
pubKeyFileName 	= "pubKey.txt"




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

def serializeObject(objectToSerialize):
	serialized = example.Serialized()
	objectToSerialize.Serialize(serialized)
	return serialized

def stringToSerialization(serializedString):
	serialized = example.Serialized()
	example.StringToSerialization(serializedString, serialized)
	return serialized
	

def buildCryptoContext():
	cryptoContext = example.CryptoContextFactory.genCryptoContextFV(256, 1.006, 1, 4.0, 0, 2, 0, example.MODE.OPTIMIZED)
	cryptoContext.Enable(example.PKESchemeFeature.ENCRYPTION)
	cryptoContext.Enable(example.PKESchemeFeature.SHE)
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

def doOperationToStringSerialization(operation, argOne = None, argTwo = None, argThree = None):
	if operation == None:
		# sys.stderr.write("No operation arg supplied")
		return -1

	elif operation == 'cryptocontext':
		
		if argOne != None or argTwo != None or argThree != None:
			return -2

		cryptoContext = buildCryptoContext()

		serializedCryptoContext = example.Serialized()
		cryptoContext.Serialize(serializedCryptoContext)
		stringSerializedCC 		= example.SerializationToString(serializedCryptoContext, '')[1]

		return stringSerializedCC

	elif operation == 'keygen':

		if argOne == None or argTwo != None or argThree != None:

			return -3
		
		serializedCCString = argOne

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

		return json.dumps(returnDict)


	elif operation == 'encrypt':
		
		if argOne == None or argTwo == None or argThree == None:
			return -4

		serializedCCString 	= argOne

		serializedCC = example.Serialized()
		example.StringToSerialization(serializedCCString, serializedCC)
		cryptoContext = example.CryptoContextFactory.DeserializeAndCreateContext(serializedCC, False)


		serializedPublicKeyString 	= argTwo

		serializedPublicKey = example.Serialized()
		example.StringToSerialization(serializedPublicKeyString, serializedPublicKey)
		publicKey = cryptoContext.deserializePublicKey(serializedPublicKey)


		plaintext = argThree

		ciphertext = encryptBytePlaintext(cryptoContext, publicKey, plaintext)

		serializedCiphertext = example.Serialized()
		ciphertext[0].Serialize(serializedCiphertext)
		serializedCiphertextString 	= example.SerializationToString(serializedCiphertext, '')[1]

		return serializedCiphertextString


	elif operation == 'decrypt':
		
		if argOne == None or argTwo == None or argThree == None:
			return -5


		serializedCCString 	= argOne

		serializedCC = example.Serialized()
		example.StringToSerialization(serializedCCString, serializedCC)
		cryptoContext = example.CryptoContextFactory.DeserializeAndCreateContext(serializedCC, False)


		serializedPrivateKeyString 	= argTwo

		serializedPrivateKey = example.Serialized()
		example.StringToSerialization(serializedPrivateKeyString, serializedPrivateKey)
		privateKey = cryptoContext.deserializeSecretKey(serializedPrivateKey)


		serializedCiphertextString 	= argThree

		serializedCiphertext = example.Serialized()
		example.StringToSerialization(serializedCiphertextString, serializedCiphertext)
		ciphertext 			= cryptoContext.deserializeCiphertext(serializedCiphertext)

		plaintext = decryptBytePlaintext(cryptoContext, privateKey, ciphertext)

		return plaintext





























# def buildStringSerializedCryptoContext():
# 	cryptoContext = example.CryptoContextFactory.genCryptoContextFV(256, 1.006, 1, 4.0, 0, 2, 0, example.MODE.OPTIMIZED)
# 	cryptoContext.Enable(example.PKESchemeFeature.ENCRYPTION)
# 	cryptoContext.Enable(example.PKESchemeFeature.SHE)

# 	serializedCC = example.Serialized();
# 	cryptoContext.Serialize(serializedCC)

# 	return example.SerializationToString(serializedCC, '')[1]

# def stringSerializedCryptoContext():
# 	cryptoContext = example.CryptoContextFactory.genCryptoContextFV(256, 1.006, 1, 4.0, 0, 2, 0, example.MODE.OPTIMIZED)
# 	cryptoContext.Enable(example.PKESchemeFeature.ENCRYPTION)
# 	cryptoContext.Enable(example.PKESchemeFeature.SHE)

# 	serializedCC = example.Serialized();
# 	cryptoContext.Serialize(serializedCC)

# 	ccFile = open(cryptoContextOneFileName, "w")
# 	ccFile.write( example.SerializationToString(serializedCC, '')[1])
# 	ccFile.close()


# 	return cryptoContextOneFileName


# def jsonStringSerializedKeygen(serializedCryptocontextString):

# 	serializedCryptocontext = example.Serialized()
# 	example.StringToSerialization(serializedCryptocontextString, serializedCryptocontext)
# 	cryptoContext = example.CryptoContextFactory.DeserializeAndCreateContext(serializedCryptocontext, False)
	
# 	keyPair 		= cryptoContext.KeyGen()
# 	cryptoContext.EvalMultKeyGen(keyPair.secretKey)

# 	newSerializedCryptoContext 	= example.Serialized();
# 	serializedPublicKey			= example.Serialized();
# 	serializedPrivateKey		= example.Serialized();

# 	cryptoContext.Serialize(newSerializedCryptoContext)
# 	keyPair.publicKey.Serialize(serializedPublicKey)
# 	keyPair.secretKey.Serialize(serializedPrivateKey)

# 	ccFile = open(cryptoContextFinalFileName, "w")
# 	ccFile.write( example.SerializationToString(newSerializedCryptoContext, '')[1])
# 	ccFile.close()

# 	pubKeyFile = open(pubKeyFileName, "w")
# 	pubKeyFile.write(example.SerializationToString(serializedPublicKey, '')[1])
# 	pubKeyFile.close()

# 	privKeyFile = open(privKeyFileName, "w")
# 	privKeyFile.write(example.SerializationToString(serializedPrivateKey, '')[1])
# 	privKeyFile.close()

# 	ret = {}
# 	ret['cryptocontext_file'] 	= cryptoContextFinalFileName
# 	ret['pubkey_file'] 			= pubKeyFileName
# 	ret['privkey_file'] 		= privKeyFileName

# 	return json.dumps(ret)


# def stringSerializedEncrypt(serializedCryptocontextString, serializedPublicKeyString, plaintext):

# 	serializedCryptocontext = example.Serialized()
# 	example.StringToSerialization(serializedCryptocontextString, serializedCryptocontext)
# 	cryptoContext = example.CryptoContextFactory.DeserializeAndCreateContext(serializedCryptocontext, False)

# 	serializedPublicKey = example.Serialized()
# 	example.StringToSerialization(serializedPublicKeyString, serializedPublicKey)
# 	publicKey 			= cryptoContext.deserializePublicKey(serializedPublicKey)

# 	ciphertext = cryptoContext.Encrypt(publicKey, example.BytePlaintextEncoding(plaintext), True, True)
# 	serializedCiphertext = example.Serialized()
# 	ciphertext[0].Serialize(serializedCiphertext)

# 	ctextFileP = open(ctextFileName, "w")
# 	ctextFileP.write(example.SerializationToString(serializedCiphertext, '')[1])
# 	ctextFileP.close()

# 	return ctextFileName

# def decrypt(serializedCryptocontextString, serializedPrivateKeyString, serializedCiphertextString):


# 	serializedCryptocontext = example.Serialized()
# 	example.StringToSerialization(serializedCryptocontextString, serializedCryptocontext)

# 	cryptoContext = example.CryptoContextFactory.DeserializeAndCreateContext(serializedCryptocontext, False)
# 	# exit()
			

# 	serializedPrivateKey = example.Serialized()
# 	example.StringToSerialization(serializedPrivateKeyString, serializedPrivateKey)
# 	privateKey 			= cryptoContext.deserializeSecretKey(serializedPrivateKey)

	

# 	serializedCiphertext = example.Serialized()
# 	example.StringToSerialization(serializedCiphertextString, serializedCiphertext)
# 	ciphertext 			= cryptoContext.deserializeCiphertext(serializedCiphertext)


# 	# plaintext = cryptoContext.decrypt(cryptoContext, privateKey, ciphertext)


# 	plaintextDec = example.BytePlaintextEncoding("")


	
# 	# plaintextDec = example.IntPlaintextEncoding([])
#     # decryptResult = cryptoContext.Decrypt(secKey, ciphertext, plaintextDec, True)

# 	decryptResult = cryptoContext.Decrypt(privateKey, [ciphertext], plaintextDec, True)
# 	plaintextDec = example.decodeBytes(plaintextDec)
# 	plaintextDec = plaintextDec[:decryptResult.messageLength]

# 	return plaintextDec


# # def encryptBitwise(cryptoContext, pubKey, val):
# # 	bitField = [if digit=='1' else 0 for digit in bin(n)[2:]]
# # 	encryptedBits = []
# # 	for bit in bitField:
# # 		encryptedBits[] = cryptoContext.Encrypt(pubKey, cryptoContext.MakeIntegerPlaintext(bit))
# # 	return encryptedBits

# serialized = example.Serialized()

# if not len(sys.argv) > 1:
# 	sys.stderr.write("No args supplied")
# 	sys.exit(1)

# elif sys.argv[1] == 'cryptocontext':
	
# 	if len(sys.argv) != 2:
# 		sys.stderr.write("Too many args for cryptocontext")
# 		sys.stdout.flush()
# 		sys.stderr.flush()
# 		sys.exit(1)

# 	print(stringSerializedCryptoContext())
# 	sys.stdout.flush()
# 	sys.exit(0)

# elif sys.argv[1] == 'keygen':
# 	# print(str(len(sys.argv)) + "the len")
# 	# sys.stdout.flush()
# 	# sys.exit(1)

# 	if len(sys.argv) != 3:
# 		sys.stderr.write("Need 1 args for keygen")
# 		sys.stdout.flush()
# 		sys.stderr.flush()
# 		sys.exit(1)
	
# 	ccFile = open(sys.argv[2], "r") 
# 	ccData = ccFile.read() 
# 	ccFile.close()

# 	# serializedCryptocontext = arg[2]
# 	print(jsonStringSerializedKeygen(ccData	))
# 	sys.stdout.flush()
# 	sys.exit(0)

# elif sys.argv[1] == 'encrypt':
# 	if len(sys.argv) != 5:
# 		sys.stderr.write("Need 3 args for encrypt")
# 		sys.stdout.flush()
# 		sys.stderr.flush()
# 		sys.exit(1)	
	
# 	pubKeyFile = open(sys.argv[3], "r") 
# 	pubKeyData = pubKeyFile.read() 
# 	pubKeyFile.close()

# 	ccFile = open(sys.argv[2], "r") 
# 	ccData = ccFile.read() 
# 	ccFile.close()

# 	# serializedCryptocontext = argv[2]
# 	# serializedPublicKey 	= argv[3]
# 	# plaintext 				= argv[4]
# 	print(stringSerializedEncrypt(ccData, pubKeyData, sys.argv[4]))
# 	sys.stdout.flush()
# 	sys.exit(0)

# elif sys.argv[1] == 'decrypt':
# 	if len(sys.argv) != 5:
# 		sys.stderr.write("Need 3 args for decrypt")
# 		sys.stdout.flush()
# 		sys.stderr.flush()
# 		sys.exit(1)
	
# 	# serializedCryptocontext = argv[2]
# 	# serializedPrivateKey 	= argv[3]
# 	# serializedCiphertext 	= argv[4]

	

# 	ccFile = open(sys.argv[2], "r") 
# 	ccData = ccFile.read() 
# 	ccFile.close()

# 	privKeyFile = open(sys.argv[3], "r") 
# 	privKeyData = privKeyFile.read() 
# 	privKeyFile.close()

# 	ctextFile = open(sys.argv[4], "r") 
# 	ctextData = ctextFile.read() 
# 	ctextFile.close()


# 	print(decrypt(ccData, privKeyData, ctextData))
# 	sys.stdout.flush()
# 	sys.exit(0)


# sys.stderr.write("Invalid operation")
# sys.stdout.flush()
# sys.stderr.flush()
# sys.exit(1)


