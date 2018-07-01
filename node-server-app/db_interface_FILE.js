



var dataDirectory = "./data_dir/"

/*

data paths
	
		// stores serialized cc files
	cryptoContext 
		{dataDirectory}/{user_id}/cryptocontext/{ccId}.txt





		// public and private keypairs are linked by a keypair id
		// becomes more complex when doing proxy re-encrypt

		// ccId is a foreign key for cryptoContext
		// keypairId is foreign key between public and private

	public keys 
		{dataDirectory}/{user_id}/publickeys/{ccId}/{keypairId}.txt

	private keys
		{dataDirectory}/{user_id}/privatekeys/{ccId}/{keypairId}.txt



	collections
		{dataDirectory}/{user_id}/collections/

	plaintext
		{dataDirectory}/{user_id}/collections/{collection_id}/plaintext/{plaintext.id}

		// each ciphertext is linked to a keypair in that it was used to encrypt, and can be used to decrypt the data
	ciphertext
		{dataDirectory}/{user_id}/collections/{collection_id}/ciphertext/{cryptocontext_id}/{keypairId}/{ciphertext.id}
	

getIds:

	// retreive the list of existing ids for each type of data

	getAllCryptoContextIds 	= function(userId);
	getAllCollectionIds 	= function(userId);
	getAllPublicKeyIds 		= function(userId, cryptoContextId);
	getAllPrivateKeyIds 	= function(userId, cryptoContextId);
	getAllPlaintextIds 		= function(userId, collectionId);
	getAllCiphertextIds 	= function(userId, collectionId, cryptoContextId);

get (data):

	// get call for each type of data (minus collections because collections is a parent directory of plaintex/ciphertext)

	getCryptoContext 	= function(userId, cryptoContextId);
	getPublicKey 		= function(userId, cryptoContextId, publicKeyId);
	getPrivateKey 		= function(userId, cryptoContextId, privateKeyId);
	getPlaintext 		= function(userId, collectionId, 	plaintextId);
	getCiphertext 		= function(userId, collectionId, 	cryptoContextId, ciphertextId);


add new group id:
	addNewCollection = function(userId, collectionId = null);

put (data):

	// put call for each type of data (minus collections because collections is a parent directory of plaintex/ciphertext)
	// when passed null, they will create a new entry using auto increment id

	var putCryptoContext 	= function(dataString, userId, cryptoContextId) = null;
	var putPublicKey 		= function(dataString, userId, cryptoContextId, publicKeyId = null);
	var putPrivateKey 		= function(dataString, userId, cryptoContextId, privateKeyId = null);
	var putPlaintext 		= function(dataString, userId, collectionId, 	plaintextId = null);
	var putCiphertext 		= function(dataString, userId, collectionId, 	cryptoContextId, ciphertextId = null);


hellpers:
	
		@return is array of strings values of file/dir names with the suffix removed
	var getFileDirNamesWithoutSuffix 	= function(path, isFile = true, suffix = null);

		@return is string value of auto inremented id based on the existing ids in arrayOfStrings
	var getNextIncrementId				= function(arrayOfStrings);




*/




// used to go to path, reutrn if (isFile|isDirectory) and remove suffix or no suffix
// returns array of strings 
// can use glob('/pth/pattern-capture(dir|file)')
var getFileDirNamesWithoutSuffix = function(path, isFile = true, suffix = null){
	if (!fs.existsSync(path)){
		return false;
	}
	var retFileDirs = [];
	fs.readdirSync(path, (err, filedirs) => {
		filedirs.forEach(filedir => {
			if(isFile){
				if(fs.lstatSync(filedir).isFile()){
					if(suffix == null){
						retFileDirs.push(path.basename(filedir));
					}
					else{
						retFileDirs.push(path.basename(filedir, suffix));
					}
				}
			}
			else{
				if(fs.lstatSync(filedir).isDirectory()){
					retFileDirs.push(path.basename(filedir));
				}
			}
		});
	});
	if(retFileDirs.length == 0){
		return false;
	}
}


var getNextIncrementId = function(arrayOfStrings){
	var maxVal = -1;
	arrayOfStrings.forEach(single => {
		var theInt = parseInt(single);
		if(theInt > maxVal){
			maxVal = theInt;
		}
	});
	if(maxVal == -1){
		return "1";
	}
	return toString(maxVal);
}




var get = function(path, dataId){
	if (!fs.existsSync(path + dataId + ".txt")){
		return false;
	}
	if(fs.lstatSync(path).isDirectory()){
		return false;
	}
	return fs.readFileSync(path + dataId + ".txt", 'utf8');
}



var put = function(dataString, path, dataId = null){
	if (!fs.existsSync(path + dataId + ".txt")){
		shell.mkdir('-p', fileDirectory);
	}
	if(!fs.lstatSync(path).isDirectory()){
		return false;
	}
	if(dataId == null){
		var isFile = true;
		allDataIds = getFileDirNamesWithoutSuffix(path, isFile, ".txt");
		dataId = getNextIncrementId(allDataIds); 
	}
	fs.writeFileSync(path + dataId + ".txt", dataString);
	return dataId;
}



var getAllCryptoContextIds = function(userId){
	var isFile = false;
	return getFileDirNamesWithoutSuffix(dataDirectory+userId+	'/cryptocontext/'	+cryptoContextId+'/', isFile);
};

var getAllPublicKeyIds = function(userId, cryptoContextId){
	var isFile = false;
	return getFileDirNamesWithoutSuffix(dataDirectory+userId+	'/publickeys/'		+cryptoContextId+'/', isFile);
};

var getAllPrivateKeyIds = function(userId, cryptoContextId){
	var isFile = false;
	return getFileDirNamesWithoutSuffix(dataDirectory+userId+	'/privatekeys/'		+cryptoContextId+'/', isFile);
};

var getAllCollectionIds = function(userId){
	var isFile = false;
	return getFileDirNamesWithoutSuffix(dataDirectory+userId+	'/collections/', isFile);
};

var getAllPlaintextIds = function(userId, collectionId){
	var isFile = false;
	return getFileDirNamesWithoutSuffix(dataDirectory+userId+	'/collections/'		+collectionId+	'/plaintext/', isFile);
};

var getAllCiphertextIds = function(userId, collectionId, cryptoContextId, keyPairId){
	var isFile = true;
	return getFileDirNamesWithoutSuffix(dataDirectory+userId+'/collections/'+collectionId+'/ciphertext/'+cryptoContextId+'/'+keyPairId + '/', isFile);
};







var getCryptoContext = function(userId, cryptoContextId){
	return get(dataDirectory+userId+'/cryptocontext/', cryptoContextId);
};

// always a private public keypair, but here we must relate, '/keyPairs/publickey/'+{id}.txt
// 		{id} is the same for the public private keypair
// this is required
var getPublicKey = function(userId, cryptoContextId, publicKeyId){
	return get(dataDirectory+userId+'/publickeys/'	+cryptoContextId+'/', publicKeyId);
};

var getPrivateKey = function(userId, cryptoContextId, privateKeyId){
	return get(dataDirectory+userId+'/privatekeys/'	+cryptoContextId+'/', privateKeyId);
};

var getPlaintext = function(userId, collectionId, plaintextId){
	return get(dataDirectory+userId+'/collections/'	+collectionId 	+'/plaintext/', plaintextId);
};

var getCiphertext = function(userId, collectionId, cryptoContextId, keyPairId, ciphertextId){
	return get(dataDirectory+userId+'/collections/'	+collectionId 	+'/ciphertext/'+cryptoContextId+'/'+keyPairId + '/', ciphertextId);
};






var addNewCollection = function(userId, collectionId = null){
	
	var pathname = './'+userId+'/collections/';
	if(collectionId == null){
		var isFile = false;
		allCollectionIds = getAllCollectionIds(userId);
		collectionId = getNextIncrementId(allCollectionIds); 
	}

	var collectionDirname = pathname + collectionId + ".txt";
	if (fs.existsSync(collectionDirname)){
		return false;
	}

	shell.mkdir('-p', collectionDirname);
	return true;
}



var putCryptoContext = function(dataString, userId, cryptoContextId){
	return put(dataDirectory+userId+'/cryptocontext/', cryptoContextId);
}

var putPublicKey = function(dataString, userId, cryptoContextId, publicKeyId){
	return put(dataDirectory+userId+'/publickeys/'	+cryptoContextId+'/', publicKeyId);
}

var putPrivateKey = function(dataString, userId, cryptoContextId, privateKeyId){
	return put(dataDirectory+userId+	'/privatekeys/'		+cryptoContextId+'/');
}

var putPlaintext = function(dataString, userId, collectionId, plaintextId){
	return put(dataString './'+userId+'/collections/'+collectionId+'/plaintext/', plaintextId);
}

var putCiphertext = function(dataString, userId, collectionId, cryptoContextId, ciphertextId){
	return put(dataString, './'+userId+'/collections/'+collectionId+'/ciphertext/'+cryptoContextId+ '/', ciphertextId);
}





var assertTrue(val){
	if(!val){
		throw new Error('assert true error thrown')
	}
	return;
}


























var get = function(..args){
	switch(type){
		case 'cryptocontext':
			userId
			ccId
			data = readFile('./{userId}/cryptocontext/{ccId}/serialized.txt');
			if(!data){
				return false;
			}
			return data;
			break;
		case 'publickeys':
			userId
			ccId
			pubkeyId
			data = readFile('./{userId}/cryptocontext/{ccId}/serialized.txt');
			if(!data){
				return false;
			}
			return data;
			break;
		case 'privatekey':
			break;
		case 'collections':
			break;
		case 'plaintext':
			break;
		case 'ciphertext':
			break;

	}
}


var puet = function(..args){
	switch(type){
		case 'cryptocontext':
			break;
		case 'publickeys':
			break;
		case 'privatekey':
			break;
		case 'collections':
			break;
		case 'plaintext':
			break;
		case 'ciphertext':
			break;

	}
}





/*


User fhe data structure

./user_data/{user_id}/cryptocontext/{cryptocontext_id}.txt
./user_data/{user_id}/collections/{collection_id}/plaintext/{plaintext_id}.txt
./user_data/{user_id}/collections/{collection_id}/ciphertext/{cryptocontext_id}/{ctext_id}.txt


*/


var fs = require('fs');

var shell = require('shelljs');

var path = require('path');


var dataTypes = ['cryptocontext', 'plaintext', 'ciphertext'];
var putData = function(dataType, dataString, userId, dataId, collectionId = null, cryptocontextId = null){
	if(!dataTypes.includes(dataType)){
		console.log('error in putData(). bad data type : ' + dataType);
		return false;
	}
	var fileDirectory = './user_data/'+userId + '/';

	var filename = '';


	if(dataType == 'collections'){
		if(dataId == null){

			// get next max id to use
			var collectionIds = getAllCollectionIds(userId);
			dataId = getNextIncrementId(collectionIds);
		}
		if (!fs.existsSync(fileDirectory + './collections/'+dataId+'/')){
			shell.mkdir('-p', fileDirectory);
		}
	}


	var dataFileInfo = getDataDirPathAndInfoForType(dataType, userId, secondId, thirdId);
	var fileDirectory = path.dirname(dataFileInfo.directory);




	switch(dataType){


		// used to create a new collection, and the collection directory
		case 'collections':

			// pass null data string and null data id to create a new collection with incremented id
			if(dataId == null){

				// get next max id to use
				var collectionIds = getAllCollectionIds(userId);
				dataId = getNextIncrementId(collectionIds);
			}
			if (!fs.existsSync(fileDirectory + './collections/'+dataId+'/')){
				shell.mkdir('-p', fileDirectory);
			}
			return true;
			break;
		case 'cryptocontext':
			fileDirectory += 'cryptocontext/';
			filename = dataId + '.txt';
			break;
		case 'plaintext':
			if(collectionId == null){
				console.log('put plaintext needs a collectionId. got null.');
				return false;
			}
			fileDirectory += 'collections/' + collectionId + '/plaintext/';
			filename = dataId + '.txt';
			break;
		case 'ciphertext':
			if(collectionId == null){
				console.log('put ciphertext needs a collectionId. got null.');
				return false;
			}
			if(cryptocontextId == null){
				console.log('put ciphertext needs a cryptocontext_id. got null.');
				return false;
			}
			fileDirectory += 'collections/' + collectionId + '/ciphertext/'+cryptocontextId+'/';
			filename = dataId + '.txt';
			break;
		default:
			return false;
	}

	if (!fs.existsSync(fileDirectory)){
		shell.mkdir('-p', fileDirectory);
	}

	fs.writeFileSync(fileDirectory + filename, dataString);
	return true;
}




var getData = function(dataType, userId, dataId, collectionId = null, cryptocontextId = null){
	if(!dataTypes.includes(dataType)){
		console.log('error in getData(). bad data type : ' + dataType);
		return false;
	}
	var fileDirectory = null;
	var filename = '';

	var dataFileInfo = getDataDirPathAndInfoForType(dataType, userId, secondId, thirdId);
	var fileDirectory = path.dirname(dataFileInfo.directory);

	if(!dataFileInfo){
		console.log('bad reutrn data file info');
		return false;
	}
	if(dataFileInfo.isFile){
		filename = dataId + '.txt';
	}
	else{
		filename = dataId;
	}

	if (!fs.existsSync(fileDirectory + filename)){
		return false;
	}
	return fs.readFileSync(fileDirectory + filename, 'utf8');
}



// also do add (don't pass the data id, will return via auto increment or false if failed)

var putCryptoContext = function(serializedCC, userId, ccId = null){
	if(ccId == null){
		// need to generate a new auto incremented id
		var theId = -1;
		varCCIds = getAllCryptoContextIds(userId);
		if(!varCCIds){
			theId = "1";
		}
		else{
			theId = getNextIncrementId(varCCIds);
		}
	}
	return putData('cryptocontext', serializedCC, userId, ccId);
};


var getCryptoContext = function(userId, ccId){
	return getData('cryptocontext', userId, ccId);
};


var putPlaintext = function(plaintext, userId, collectionId = null, plaintextId = null){

	var = newIncrementId '';
	if(collectionId == null){
		// need to generate a new auto incremented id
		var collectionIds = getAllCollectionIds(userId);
		collectionId = getNextIncrementId(collectionIds);
	}

	if(plaintextId == null){
		// need to generate a new auto incremented id
		var plaintextIds = getAllPlaintextIds(userId, collectionId);
		plaintextId = getNextIncrementId(plaintextIds);
	}

	return putData('plaintext', plaintext, userId, collectionId, plaintextId);
};


var getPlaintext = function(userId, plaintextId, collectionId){
	return getData('plaintext', userId, plaintextId, collectionId);
};

var putCiphertext = function(plaintext, userId, ciphertextId = null, collectionId, cryptocontextId){

	if(ciphertextId == null){
		// need to generate a new auto incremented id
		var ciphertextIds = getAllCiphertextIds(userId, collectionId, cryptocontextId);
		if(!ciphertextIds){
			ciphertextId = "1";
		}
		else{
			ciphertextId = getNextIncrementId(ciphertextIds);
		}
	}
	return putData('ciphertext', plaintext, userId, ciphertextId, collectionId, cryptocontextId);
};


var getCiphertext = function(userId, plaintextId, collectionId, cryptocontextId){
	return getData('ciphertext', userId, plaintextId, collectionId, cryptocontextId);
};







// used to go to path, reutrn if (isFile|isDirectory) and remove suffix or no suffix
// returns array of strings 
// can use glob('/pth/pattern-capture(dir|file)')
var getFileDirNamesWithoutSuffix = function(path, isFile = true, suffix = null){
	if (!fs.existsSync(path)){
		return false;
	}

	var retFileDirs = [];

	fs.readdirSync(path, (err, filedirs) => {
		filedirs.forEach(filedir => {
			if(isFile){
				if(fs.lstatSync(filedir).isFile()){
					if(suffix == null){
						retFileDirs.push(path.basename(filedir));
					}
					else{
						retFileDirs.push(path.basename(filedir, suffix));
					}
				}
			}
			else{
				if(fs.lstatSync(filedir).isDirectory()){
					retFileDirs.push(path.basename(filedir));
				}
			}
		});
	});

	if(retFileDirs.length == 0){
		return false;
	}
}

// // return all file names within a directory
// var getAllFileNames = function(dirname){
// 	return getFileDirWithoutPrefix(dirname, true);
// }

// // return all file names within a directory and remove the prefix (ex: all file excpet .txt)
// var getAllFileNamesWithoutPrefix = function(dirname, prefix){
// 	return getFileDirNamesWithoutPrefix(dirname, true, prefix);
// }

// // return all directory names within a directory
// var getAllDirNames = function(dirname, prefix = null){
// 	return getFileDirNamesWithoutPrefix(dirname, true, prefix);
// }


var getDataDirPathAndInfoForType = function(dataType, userId, secondId = null, thirdId = null){
	var directory = null;
	var isFile = null;
	var suffix = null;
	switch(dataType){
		case 'collections':
			directory = './user_data/'+userId + '/collections/';
			isFile = false;
			break;
		case 'cryptocontext':
			directory = './user_data/'+userId + '/cryptocontext/';
			isFile = true;
			suffix = ".txt";
			break;
		case 'plaintext':
			if(secondId == null){
				console.log('missing collection id get dir path plaintext');
				return false;
			}
			collectionId = secondId
			directory = './user_data/'+userId + '/collections/' + collectionId + '/plaintext/';
			isFile = true;
			suffix = ".txt";
			break;
		case 'ciphertext':
			if(secondId == null){
				console.log('missing second collection id get dir path ciphertext');
			}
			collectionId = secondId;

			if(thirdId == null){
				console.log('missing third cryptocontextId id get dir path ciphertext');
				return false;
			}
			cryptocontextId = thirdId;
			directory = './user_data/'+userId + '/collections/' + collectionId + '/ciphertext/' + cryptocontextId +'/' ;
			isFile = true;
			suffix = ".txt";
			break;
		default:
			return false;
	}
	return {directory : directory, isFile : isFile, suffix: suffix};
}

// return array of ids for entries, return as array of strings representing int values only. ex: \"14\"
var getAllIdsForDataTypeAsString = function(dataType, userId, collectionId = null, cryptocontextId = null){
	var directoryAndInfo = getDataDirPathAndInfoForType(dataType, userId, collectionId, cryptocontextId);

	if(!directoryInfo){
		console.log('error with directory in getAllIdsForDataTypeAsString');
		return false;
	}

	// want to do a glob here
	return getFileDirNamesWithoutSuffix(directoryAndInfo.directory, directoryAndInfo.isFile, directoryAndInfo.suffix); 
}


// returns false if none or directory not yet made
var getAllCollectionIds = function(userId){
	return getAllIdsForDataTypeAsString('collections', userId);
};

// returns false if none or directory not yet made
var getAllPlaintextIds = function(userId, collectionId){
	return getAllIdsForDataTypeAsString('plaintext', userId, collectionId);
};

// returns false if none or directory not yet made

var getAllCryptoContextIds = function(userId){
	return getAllIdsForDataTypeAsString('cryptocontext', userId);
};

// returns false if none or directory not yet made
var getAllCiphertextIds = function(userId, collectionId, cryptocontextId){
	return getAllIdsForDataTypeAsString('ciphertext', userId, collectionId, cryptocontextId);
};


var getNextIncrementId = function(arrayOfStrings){
	var maxVal = -1;
	arrayOfStrings.forEach(single => {
		var theInt = parseInt(single);
		if(theInt > maxVal){
			maxVal = theInt;
		}
	});
	if(maxVal == -1){
		return "1";
	}
	return toString(maxVal);
}


var assertTrue = function (booleanArg) {
	if(!booleanArg){
		throw new Error('err here. here erg');
	}
}


var newCollection = function(userId){
	var allCollectionIds = getAllCollectionIds(userId);
	var newMaxId = null;
	if(!allCollectionIds || allCollectionIds.length == 0){
		newMaxId = "1";
	}
	else{
		newMaxId = getNextIncrementId(allCollectionIds);
	}
	var dataDir = './user_data/collections/'+userId;
	
}

var userId = "12";
var user_data_dir = './user_data/';


var ccText1 = "serilaized crpyto context text 1";


var ccText2 = "serilaized crypto context text 2";
var ccIdTwo = putCryptoContext(userId, "3");
assertTrue(ccIdTwo == "3");
assertTrue(getCryptoContext(userId, ccIdTwo) == ccText2);

// use null for auto increment
var ccIdOne = putCryptoContext(userId, null);
assertTrue(ccIdOne == "4");
assertTrue(getCryptoContext(userId, ccIdOne) == ccText1);

var ptText1 = "serilaized plaintext text 1";
var collectionId = "5";






var plaintextId = null);
var newPlaintextId = null;
var ptText = null;

plaintextId = "3";
var ptText = "serilaized plaintext text 1";
newPlaintextId = putPlaintext(ptText1, userId, collectionId, plaintextId);

assertTrue(plaintextId == newPlaintextId);
assertTrue(getPlaintext(userId, newPlaintextId) == ptText);



plaintextId = null;
var ptText = "serilaized plaintext text 3. sto increment to 4.";
newPlaintextId = putPlaintext(ptText1, userId, collectionId, plaintextId);

assertTrue("4" == newPlaintextId);
assertTrue(getPlaintext(userId, newPlaintextId) == ptText);






var collectionId = "4";

var ccText1 = "ciphertext text 1";
putCiphertext()
getCiphertext()

var ctText1 = "serilaized ciphertext text 1";
var ctIdOne = putCiphertext(userId, "3");
assertTrue(ccIdTwo == "3");
assertTrue(getPlaintext(userId, ctIdOne) == ptText1);

// use null for auto-increment
var ctText2 = "serilaized ciphertext text 2";
var ctIdTwo = putPlaintext(userId, null, collectionId);
assertTrue(ptIdTwo == "4");
assertTrue(getPlaintext(userId, ctIdTwo) == ptText2);





var ccText1 = "public key text 1";
putPublicKey()
getPublicKey()


var ccText1 = "privatekey text 1";
putPrivateKey()
getPrivateKey()






try{	
	putCryptoContext("A CCccca", "11", "22");
}catch(err) {
	console.error(err);
	return false;
}

ccData = getCryptoContext("11", "22");

console.log(ccData);







// create the directories for a new collection
var newId;


// upload and retreive serialized crypto context data
newId = put(ccData, userId, 'cryptocontext', null);
newId = put(ccData, userId, 'cryptocontext', cryptoContextId);

// upload and retreive serialized crypto context data
newId = put(ccData, userId, 'privateKey', cryptoContextId, keyId);
newId = put(ccData, userId, 'publicKey'	, cryptoContextId, keyId);

newId = put(null, userId, 'collections', null);
newId = put(null, userId, 'collections', collectionId);

// newId = put(plaintextData, userId, 'plaintext', null, null);
newId = put(plaintextData, userId, 'plaintext', collectionId, null);
newId = put(plaintextData, userId, 'plaintext', collectionId, plaintextId);

newId = put(ciphertextData, userId, 'ciphertext', collectionId, cryptoContextId, null);
newId = put(null, 			userId, 'ciphertext', collectionId, cryptoContextId, ciphertextId);



var data;

/*
argOne : 	cryptoContextId/collectionId
argTwo: 	keyId/plaintextId/cryptoContextId(for ciphertext relation)
argThree 	ciphertextId

supply null data id for all
*/
shell.mkdir('-p', fileDirectory);
var get = function(data, userId, opperationType, argOne, argTwo, argThree){

	var dataFileInfo = getDataDirPathAndInfoForType(opperationType, userId, argOne, argTwo, argThree);
	if (!fs.existsSync(dataFileInfo.directory)){
		return false;
	}

	var fullpath = null;
	if(dataFileInfo.isFile == true){
		fullpath = dataFileInfo.directory + argOne + ".txt";
	}
	else{

	}
	


}
data = get(userId, 'cryptocontext', argOne, argTwo, argThree, argFour);
data = get(userId, 'privateKey', cryptoContextId);
data = get(userId, 'publicKey', cryptoContextId);
data = get(userId, 'collections', cryptoContextId);
data = get(userId, 'plaintext', cryptoContextId);
data = get(userId, 'ciphertext', cryptoContextId);




