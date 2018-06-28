import subprocess
import time
import json

import fhe

print("starting")
cmd = "python3 ./fhe.py cryptocontext"

cc = fhe.doOperationToStringSerialization('cryptocontext')
# cc = subprocess.check_output(['python3', './fhe.py', 'cryptocontext'], shell=False)
# # out = p.stdout.read()

# cc = cc.decode('utf-8').strip()
# print("cc 1 file is aa" + cc)

print("crypto context gen complete")
# key_files = subprocess.check_output(['python3', './fhe.py', 'keygen', cc], shell=False)

# key_files = key_files.decode('utf-8')

# print("reutnred key files : " + key_files)

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
# ccFile = open("cryptocontext.txt", "w")
# ccFile.write(keysJson['cryptocontext'])
# ccFile.close()

# pubKeyFile = open("pubKey.txt", "w")
# pubKeyFile.write(keysJson['pubkey'])
# pubKeyFile.close()

# privKeyFile = open("privKey.txt", "w")
# privKeyFile.write(keysJson['privkey'])
# privKeyFile.close()


ctext = fhe.doOperationToStringSerialization('encrypt', newcc, publickey, val)
# print(ctext)

# ctextfilename = subprocess.check_output(['python3', './fhe.py', 'encrypt', keysJson['cryptocontext_file'], keysJson['pubkey_file'], str(val)], shell=False)

# ctextfilename = ctextfilename.decode('utf-8').strip()

print("has ctext")
decryptedVal = fhe.doOperationToStringSerialization('decrypt', newcc, privateKey, ctext)

# print("ctext file is : " + ctextfilename)

# ctextFile = open("ctext.txt", "w")
# ctextFile.write(str(encryptedVal))
# ctextFile.close()
# print(str(len(cc)) + "first len " + str(len(keysJson['cryptocontext'])));
# exit()
# decryptedVal = subprocess.check_output(['python3', './fhe.py', 'decrypt', keysJson['cryptocontext_file'], keysJson['privkey_file'], ctextfilename], shell=False)

# decryptedVal = decryptedVal.decode('utf-8').strip()
print("FINAL!!! :" + decryptedVal +"::")