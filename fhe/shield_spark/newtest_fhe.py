import subprocess
import time
import json

import fhe

print("starting")
cmd = "python3 ./fhe.py cryptocontext"

cc = fhe.doOperationToStringSerialization('cryptocontext')


print("crypto context gen complete")


keyDictJson = fhe.doOperationToStringSerialization('keygen', cc)

keyDict = json.loads(keyDictJson)
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

newcc 		= keyDict['cryptocontext']
publickey 	= keyDict['publickey']
privateKey 	= keyDict['privatekey']


ctext = fhe.doOperationToStringSerialization('encrypt', newcc, publickey, val)


print("has ctext")
decryptedVal = fhe.doOperationToStringSerialization('decrypt', newcc, privateKey, ctext)

print("FINAL!!! :" + decryptedVal +"::")