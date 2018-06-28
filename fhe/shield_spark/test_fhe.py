import subprocess
import time
import json

print("starting")
cmd = "python3 ./fhe.py cryptocontext"
cc = subprocess.check_output(['python3', './fhe.py', 'cryptocontext'], shell=False)
# out = p.stdout.read()

cc = cc.decode('utf-8').strip()
print("cc 1 file is aa" + cc)


time.sleep(1)
print("next")
time.sleep(1)
key_files = subprocess.check_output(['python3', './fhe.py', 'keygen', cc], shell=False)

key_files = key_files.decode('utf-8')

print("reutnred key files : " + key_files)

keysJson= json.loads(key_files)
if 'cryptocontext_file' not in keysJson:
	print("ERRRRR cc")
	exit()

elif 'pubkey_file' not in keysJson:
	print("ERRRRR pubkey")
	exit()

elif 'privkey_file' not in keysJson:
	print("ERRRRR privkey")
	exit()


time.sleep(1)
print("next 2")
time.sleep(1)



val = "aaV"

# ccFile = open("cryptocontext.txt", "w")
# ccFile.write(keysJson['cryptocontext'])
# ccFile.close()

# pubKeyFile = open("pubKey.txt", "w")
# pubKeyFile.write(keysJson['pubkey'])
# pubKeyFile.close()

# privKeyFile = open("privKey.txt", "w")
# privKeyFile.write(keysJson['privkey'])
# privKeyFile.close()

ctextfilename = subprocess.check_output(['python3', './fhe.py', 'encrypt', keysJson['cryptocontext_file'], keysJson['pubkey_file'], str(val)], shell=False)

ctextfilename = ctextfilename.decode('utf-8').strip()

print("ctext file is : " + ctextfilename)

# ctextFile = open("ctext.txt", "w")
# ctextFile.write(str(encryptedVal))
# ctextFile.close()
# print(str(len(cc)) + "first len " + str(len(keysJson['cryptocontext'])));
# exit()
decryptedVal = subprocess.check_output(['python3', './fhe.py', 'decrypt', keysJson['cryptocontext_file'], keysJson['privkey_file'], ctextfilename], shell=False)

decryptedVal = decryptedVal.decode('utf-8').strip()
print("FINAL!!! :" + decryptedVal +"::")