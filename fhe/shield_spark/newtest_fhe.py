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