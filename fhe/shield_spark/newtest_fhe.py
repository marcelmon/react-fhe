import subprocess
import time
import json

import fhe

print("starting")
cmd = "python3 ./fhe.py cryptocontext"

cc = fhe.generateCryptoContextToStringSerialization()

print("crypto context gen complete")

print("doing keygen")

keyDict = fhe.keygenToStringSerialization(cc)
print("checking keygen result")

if 'cryptocontext' not in keyDict:
	print("ERRRRR cc")
	exit()

elif 'publickey' not in keyDict:
	print("ERRRRR pubkey")
	exit()

elif 'privatekey' not in keyDict:
	print("ERRRRR privkey")
	exit()

print("keygen complete")


val = "aaV"

ctextAndSample = fhe.encryptToStringSerialization(keyDict['cryptocontext'], keyDict['publickey'], val, True)

ctext = ctextAndSample['ctext'];
print("has ctext")
decryptedVal = fhe.decryptToStringSerialization(keyDict['cryptocontext'], keyDict['privatekey'], ctext)

print("FINAL!!! :" + decryptedVal +"::")

print("sample data:")


# ctext.sample = fhe.getCtextMatrixSampleFromSerialized(keyDict['cryptocontext'], ctext, 2, 4);

print(ctextAndSample['sample'])



print("final without sample")

ctext = fhe.encryptToStringSerialization(keyDict['cryptocontext'], keyDict['publickey'], val)
print("has ctext")
decryptedVal = fhe.decryptToStringSerialization(keyDict['cryptocontext'], keyDict['privatekey'], ctext)
print("FINAL final!!! :" + decryptedVal +"::")



print("now using deserialize funcs")

cc2 = fhe.generateCryptoContextToStringSerialization()
keyDict = fhe.keygenToStringSerialization(cc)

cc3Serial 		= keyDict['cryptocontext']
pubkeySerial 	= keyDict['publickey']
privkeySerial 	= keyDict['privatekey']

plaintext = "v"


cc3 		= fhe.stringToCryptoContext(cc3Serial)
pubkey 		= fhe.stringToPubKey(cc3, pubkeySerial)
privkey 	= fhe.stringToPrivKey(cc3, privkeySerial)

ctextNotSerial = fhe.encryptBytePlaintext(cc3, pubkey, plaintext)

pt2 = fhe.decryptBytePlaintext(cc3, privkey, ctextNotSerial)

print("expecting "+plaintext+" and got : "+pt2)

plaintext3 = "u"

ctext3Serial = fhe.encryptToStringSerialization(cc3Serial, pubkeySerial, plaintext3, False)

ctext3NotSerial = fhe.stringToCtext(cc3, ctext3Serial)
pt4 = fhe.decryptBytePlaintext(cc3, privkey, ctext3NotSerial)

print("expecting "+plaintext3+" and got : "+pt4)


print("testing int encoding")

val2 = 4
encVal = fhe.encryptIntPlaintext(cc3, pubkey, val2)

decVal = fhe.decryptIntPlaintext(cc3, privkey, encVal)

print("expecting : "+str(val2)+" got : "+str(decVal))



print("testing int encoding neg")

val3 = -2
encVal3 = fhe.encryptIntPlaintext(cc3, pubkey, val3)

decVal3 = fhe.decryptIntPlaintext(cc3, privkey, encVal3)

print("expecting : "+str(val3)+" got : "+str(decVal3))