/*
	
	getCryptoContextIds(userId)
	getCryptoContext(userId, ccId)
	putCryptoContext(ccData, userId, ccId=null)
	deleteCryptoContext(userId, ccId)
	
	getKeypairIds(userId, ccId)
	putKeypair(pubkeydata, privkeydata, userId, ccId, keypairId = null)

	getPublicKey(userId, ccId, keypairId)
	putPublicKey(pubkeyData, userId, ccId, keypairId = null) // should already have a keypair id

	getPrivateKey(userId, ccId, keypairId)
	putPrivateKey(privkeyData, userId, ccId, keypairId = null) // should already have a keypair id

	deleteKeypair(userId, ccId, keypairId)

	getCollectionIds(userId)
	putCollection(collectionName = null, userId, newCollectionId = null) // create new collection
	deleteCollection(userId, collectionId)

	getPlaintextIds(userId, collectionId)
	getPlaintext(userId, collectionId, plaintextId)
	putPlaintext(plaintextData, userId, collectionId, plaintextId = null)
	deletePlaintext(userId, collectionId, plaintextId)

	getCiphertextIds(userId, collectionId, isBitwise)
	getCiphertextBitIds(userId, collectionId, isBitwise)
	getCiphertext()
	putCiphertext()
	deleteCiphertext()

	





*/

var shell 	= require('shelljs');
var fs 		= require('fs');
var filepath = require('path');

var dataDirectory = "./data_dir/";

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
	var putCiphertext 		= function(dataString, userId, collectionId, 	plaintextId, cryptoContextId, ciphertextId = null);



get directory paths:
		// get the directory path names for each data ype using components of the primary key
	var cryptoContextDir	= function(userId);
	var publicKeyDir 		= function(userId, cryptoContextId);
	var privateKeyDir 		= function(userId, cryptoContextId);
	var collectionDir 		= function(userId);
	var plaintextDir 		= function(userId, collectionId);
	var ciphertextDir 		= function(userId, collectionId, plaintextId, cryptoContextId, keyPairId);


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
		console.log('int getFileDirNamesWithoutSuffix and path: ' + path + ' does not exist');
		return false;
	}
	var retFileDirs = [];
	var filedirs = fs.readdirSync(path);
	filedirs.forEach(filename => {
		if(isFile){

			if(fs.lstatSync(path + filename).isFile()){
				var fullFilePath = (suffix == null) ? filepath.basename(filename) : filepath.basename(filename, suffix);
				retFileDirs.push(fullFilePath);
			}
		}
		else if(fs.lstatSync(path + filename).isDirectory()){
			retFileDirs.push(filepath.basename(filename));
		}		
	});
	if(retFileDirs.length == 0){
		console.log('int getFileDirNamesWithoutSuffix and leng is 0');
		return null;
	}
	return retFileDirs;
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
		console.log('int getNextIncrementId and maxval is -1');
		return "1";
	}
	return (maxVal+1).toString();
}




var get = function(path, dataId){
	if (!fs.existsSync(path)){
		console.log('in get() - path : ' + path + " does not exist");
		return false;
	}
	if(!fs.lstatSync(path).isDirectory()){
		console.log('in get() - path : ' + path + " is not directory")
		return false;
	}
	if (!fs.existsSync(path + dataId + ".txt")){
		console.log('in get() - path : ' + path + " data id: "+ dataId +".txt is not directory")
		return false;
	}
	return fs.readFileSync(path + dataId + ".txt", 'utf8');
}



var put = function(dataString, path, dataId = null){
	if (!fs.existsSync(path)){
		shell.mkdir('-p', path);
		console.log('in put() - created dir: ' + path);
	}
	if(!fs.lstatSync(path).isDirectory()){
		console.log('in put() - dir: ' + path + " is not a directory");
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

/*
	get directory path for data type
*/
var cryptoContextDir = function(userId){
	return dataDirectory+userId+'/cryptocontext/';
}
var publicKeyDir 	 = function(userId, cryptoContextId){
	return dataDirectory+userId+'/publickeys/'+cryptoContextId+'/';
}
var privateKeyDir	 = 	function(userId, cryptoContextId){
	return dataDirectory+userId+'/privatekeys/'+cryptoContextId+'/';
}
var collectionDir 	 = function(userId){
	return dataDirectory+userId+'/collections/';
}
var plaintextDir 	 = function(userId, collectionId){
	return dataDirectory+userId+'/collections/'+collectionId+'/plaintext/';
}
var ciphertextDir 	= function(userId, collectionId, cryptoContextId, keyPairId){
	return dataDirectory+userId+'/collections/'+collectionId+'/ciphertext/'+cryptoContextId+'/'+keyPairId +'/';
}




var getAllCryptoContextIds = function(userId){
	var isFile = true;
	var suffix = ".txt";
	return getFileDirNamesWithoutSuffix( cryptoContextDir(userId), isFile, suffix);
};

var getAllPublicKeyIds = function(userId, cryptoContextId){
	var isFile = true;
	var suffix = ".txt";
	return getFileDirNamesWithoutSuffix( publicKeyDir(userId, cryptoContextId), isFile, suffix);
};

var getAllPrivateKeyIds = function(userId, cryptoContextId){
	var isFile = true;
	var suffix = ".txt";
	return getFileDirNamesWithoutSuffix( privateKeyDir(userId, cryptoContextId), isFile, suffix);
};

var getAllCollectionIds = function(userId){
	var isFile = false;
	return getFileDirNamesWithoutSuffix( collectionDir(userId), isFile);
};

var getAllPlaintextIds = function(userId, collectionId){
	var isFile = true;
	var suffix = ".txt";
	return getFileDirNamesWithoutSuffix( plaintextDir(userId, collectionId), isFile, suffix);
};

var getAllCiphertextIds = function(userId, collectionId, cryptoContextId, keyPairId){
	var isFile = true;
	var suffix = ".txt";
	return getFileDirNamesWithoutSuffix( ciphertextDir(userId, collectionId, cryptoContextId, keyPairId), isFile, suffix);
};







var getCryptoContext = function(userId, cryptoContextId){
	return get( cryptoContextDir(userId), cryptoContextId);
};

// always a private public keypair, but here we must relate, '/keyPairs/publickey/'+{id}.txt
// 		{id} is the same for the public private keypair
// this is required
var getPublicKey = function(userId, cryptoContextId, publicKeyId){
	return get( publicKeyDir(userId, cryptoContextId), publicKeyId);
};

var getPrivateKey = function(userId, cryptoContextId, privateKeyId){
	return get( privateKeyDir(userId, cryptoContextId), privateKeyId);
};

var getPlaintext = function(userId, collectionId, plaintextId){
	return get( plaintextDir(userId, collectionId), plaintextId);
};

var getCiphertext = function(userId,  collectionId, cryptoContextId, keyPairId, plaintextId){
	return get( ciphertextDir(userId, collectionId, cryptoContextId, keyPairId), plaintextId);
};






var addNewCollection = function(userId, collectionId = null){
	if(collectionId == null){
		var allCollectionIds = getAllCollectionIds(userId);
		collectionId = getNextIncrementId(allCollectionIds); 
	}

	var collectionDirname = collectionDir(userId) + collectionId + "/";
	if (fs.existsSync(collectionDirname)){
		console.log('in addNewCollection() - dir : '+ collectionDirname + " already exists");
		return false;
	}

	shell.mkdir('-p', collectionDirname);
	return collectionId;
}



var putCryptoContext 	= function(dataString, userId, cryptoContextId){
	return put(	dataString, cryptoContextDir(userId), cryptoContextId);
}

var putPublicKey 		= function(dataString, userId, cryptoContextId, publicKeyId){
	return put( dataString, publicKeyDir(userId, cryptoContextId), publicKeyId);
}

var putPrivateKey 		= function(dataString, userId, cryptoContextId,	privateKeyId){
	return put( dataString, privateKeyDir(userId, cryptoContextId), privateKeyId);
}

var putPlaintext 		= function(dataString, userId, collectionId,	plaintextId){
	return put( dataString, plaintextDir(userId, collectionId),	plaintextId);
}

var putCiphertext 		= function(dataString, 	userId, collectionId, cryptoContextId, keyPairId, plaintextId){
	return put( dataString, 	ciphertextDir( 	userId, collectionId, cryptoContextId, keyPairId), plaintextId);
}





var assertTrue = function(val){
	if(!val){
		throw new Error('assert true error thrown')
	}
	return;
}



var rmDir = function(testDataDirectory){
	if(fs.existsSync(testDataDirectory)){
		shell.rm('-r', testDataDirectory);	
	}
	assertTrue(!fs.existsSync(testDataDirectory));
}










// to test:


// getAllCryptoContextIds 	= function(userId);
// getAllCollectionIds 	= function(userId);
// getAllPublicKeyIds 		= function(userId, cryptoContextId);
// getAllPrivateKeyIds 	= function(userId, cryptoContextId);
// getAllPlaintextIds 		= function(userId, collectionId);
// getAllCiphertextIds 	= function(userId, collectionId, cryptoContextId);

// getCryptoContext 		= function(userId, cryptoContextId);
// getPublicKey 			= function(userId, cryptoContextId, publicKeyId);
// getPrivateKey 			= function(userId, cryptoContextId, privateKeyId);
// getPlaintext 			= function(userId, collectionId, 	plaintextId);
// getCiphertext 			= function(userId, collectionId, 	cryptoContextId, ciphertextId);

// addNewCollection 		= function(userId, collectionId = null);

// putCryptoContext 		= function(dataString, userId, cryptoContextId = null);
// putPublicKey 			= function(dataString, userId, cryptoContextId, publicKeyId = null);
// putPrivateKey 			= function(dataString, userId, cryptoContextId, privateKeyId = null);
// putPlaintext 			= function(dataString, userId, collectionId, 	plaintextId = null);
// putCiphertext 			= function(dataString, userId, collectionId, 	cryptoContextId, 	keypairId, plaintextId, ciphertextId = null);


var testUserId = "666";


var testCryptoContext = function(){

	rmDir(dataDirectory);

	assertTrue((!getAllCryptoContextIds(testUserId)));

	var ccId_2 = "2";
	var ccId_3 = "3";

	assertTrue(!getCryptoContext(testUserId, ccId_2));
	assertTrue(putCryptoContext("cc data 2", testUserId, ccId_2) == ccId_2);
	assertTrue(getCryptoContext(testUserId, ccId_2) == "cc data 2");

	assertTrue(!getCryptoContext(testUserId, ccId_3));
	assertTrue(putCryptoContext("cc data 3", testUserId, null) == ccId_3); // test the auto increment feature
	assertTrue(getCryptoContext(testUserId, ccId_3) == "cc data 3");


	assertTrue(putCryptoContext("cc data 3.1", testUserId, ccId_3) == ccId_3);
	assertTrue(getCryptoContext(testUserId, ccId_3) == "cc data 3.1");
	

	var newAllCryptoContextIds = getAllCryptoContextIds(testUserId);
	assertTrue(newAllCryptoContextIds.length == 2);
	assertTrue(newAllCryptoContextIds.indexOf(ccId_2) > -1);
	assertTrue(newAllCryptoContextIds.indexOf(ccId_3) > -1);
	

	// rmDir(dataDirectory);
}


var testCollectionIds = function(){

	var allCollections;

	rmDir(dataDirectory);

	assertTrue((!getAllCollectionIds(testUserId)));

	var colId_2 = "2";
	var colId_3 = "3";

	assertTrue(addNewCollection(testUserId, colId_2) == colId_2);

	allCollections = getAllCollectionIds(testUserId);
	assertTrue(allCollections.length == 1);
	assertTrue(allCollections[0] == colId_2);


	assertTrue(addNewCollection(testUserId, null) == colId_3);
	
	allCollections = getAllCollectionIds(testUserId);
	assertTrue(allCollections.length == 2);
	assertTrue(allCollections.indexOf(colId_2) > -1);
	assertTrue(allCollections.indexOf(colId_3) > -1);

	// rmDir(dataDirectory);

}


var testPublicKeys = function(){
	rmDir(dataDirectory);

	var ccId_2 	= "2";
	var keyId_2 = "2";
	var keyId_3 = "3";

	assertTrue((!getAllPublicKeyIds(testUserId, ccId_2)));


	assertTrue(!getPublicKey(testUserId, ccId_2, keyId_2));
	assertTrue(putPublicKey("pubkey data 2", testUserId, ccId_2, keyId_2) == keyId_2);
	assertTrue(getPublicKey(testUserId, ccId_2, keyId_2) == "pubkey data 2");

	assertTrue(!getPublicKey(testUserId, ccId_2, keyId_3));
	assertTrue(putPublicKey("pubkey data 3", testUserId, ccId_2, null) == keyId_3);
	assertTrue(getPublicKey(testUserId, ccId_2, keyId_3) == "pubkey data 3");


	assertTrue(putPublicKey("pubkey data 3.1", testUserId, ccId_2, keyId_3) == keyId_3);
	assertTrue(getPublicKey(testUserId, ccId_2, keyId_3) == "pubkey data 3.1");
	

	var newAllPublicKeyIds = getAllPublicKeyIds(testUserId, ccId_2);
	assertTrue(newAllPublicKeyIds.length == 2);
	assertTrue(newAllPublicKeyIds.indexOf(keyId_2) > -1);
	assertTrue(newAllPublicKeyIds.indexOf(keyId_3) > -1);
	

	// rmDir(dataDirectory);
}


var testPrivateKeys = function(){
	rmDir(dataDirectory);

	var ccId_2 	= "2";
	var keyId_2 = "2";
	var keyId_3 = "3";

	assertTrue((!getAllPrivateKeyIds(testUserId, ccId_2)));


	assertTrue(!getPrivateKey(testUserId, ccId_2, keyId_2));
	assertTrue(putPrivateKey("privkey data 2", testUserId, ccId_2, keyId_2) == keyId_2);
	assertTrue(getPrivateKey(testUserId, ccId_2, keyId_2) == "privkey data 2");

	assertTrue(!getPrivateKey(testUserId, ccId_2, keyId_3));
	assertTrue(putPrivateKey("privkey data 3", testUserId, ccId_2, null) == keyId_3);
	assertTrue(getPrivateKey(testUserId, ccId_2, keyId_3) == "privkey data 3");


	assertTrue(putPrivateKey("privkey data 3.1", testUserId, ccId_2, keyId_3) == keyId_3);
	assertTrue(getPrivateKey(testUserId, ccId_2, keyId_3) == "privkey data 3.1");
	

	var newAllPrivateKeyIds = getAllPrivateKeyIds(testUserId, ccId_2);
	assertTrue(newAllPrivateKeyIds.length == 2);
	assertTrue(newAllPrivateKeyIds.indexOf(keyId_2) > -1);
	assertTrue(newAllPrivateKeyIds.indexOf(keyId_3) > -1);
	

	// rmDir(dataDirectory);
}



var testPlaintext = function(){
	rmDir(dataDirectory);

	var colId_2 	= "2";
	var ptextId_2 	= "2";
	var ptextId_3 	= "3";

	assertTrue((!getAllPlaintextIds(testUserId, colId_2)));


	assertTrue(!getPlaintext(testUserId, colId_2, ptextId_2));
	assertTrue(putPlaintext("plaintext data 2", testUserId, colId_2, ptextId_2) == ptextId_2);
	assertTrue(getPlaintext(testUserId, colId_2, ptextId_2) == "plaintext data 2");

	assertTrue(!getPlaintext(testUserId, colId_2, ptextId_3));
	assertTrue(putPlaintext("plaintext data 3", testUserId, colId_2, null) == ptextId_3);
	assertTrue(getPlaintext(testUserId, colId_2, ptextId_3) == "plaintext data 3");


	assertTrue(putPlaintext("plaintext data 3.1", testUserId, colId_2, ptextId_3) == ptextId_3);
	assertTrue(getPlaintext(testUserId, colId_2, ptextId_3) == "plaintext data 3.1");
	

	var newAllPlaintextIds = getAllPlaintextIds(testUserId, colId_2);
	assertTrue(newAllPlaintextIds.length == 2);
	assertTrue(newAllPlaintextIds.indexOf(ptextId_2) > -1);
	assertTrue(newAllPlaintextIds.indexOf(ptextId_3) > -1);
	

	// rmDir(dataDirectory);
}


var testCiphertext = function(){
	rmDir(dataDirectory);

	var colId_2 	= "2";
	var ccId_2 		= "2";
	var keyId_2 	= "2";
	var ptextId_2 	= "2";
	var ptextId_3 	= "3";


	assertTrue((!getAllCiphertextIds(testUserId, colId_2, ccId_2, keyId_2)));


	assertTrue(!getCiphertext(testUserId, colId_2, ccId_2, keyId_2, ptextId_2));
	assertTrue(putCiphertext("ciphertext data 2", testUserId, colId_2, ccId_2, keyId_2, ptextId_2) == ptextId_2);
	assertTrue(getCiphertext(testUserId, colId_2, ccId_2, keyId_2, ptextId_2) == "ciphertext data 2");

	assertTrue(!getCiphertext(testUserId, colId_2, ccId_2, keyId_2, ptextId_3));
	assertTrue(putCiphertext("ciphertext data 3", testUserId, colId_2, ccId_2, keyId_2, null) == ptextId_3);
	assertTrue(getCiphertext(testUserId, colId_2, ccId_2, keyId_2, ptextId_3) == "ciphertext data 3");


	assertTrue(putCiphertext("ciphertext data 3.1", testUserId, colId_2, ccId_2, keyId_2, ptextId_3) == ptextId_3);
	assertTrue(getCiphertext(testUserId, colId_2, ccId_2, keyId_2, ptextId_3) == "ciphertext data 3.1");
	

	var newAllCiphertextIds = getAllCiphertextIds(testUserId, colId_2, ccId_2, keyId_2);

	assertTrue(newAllCiphertextIds.length == 2);
	assertTrue(newAllCiphertextIds.indexOf(ptextId_2) > -1);
	assertTrue(newAllCiphertextIds.indexOf(ptextId_3) > -1);
	

	// rmDir(dataDirectory);
}




var testAll = function(){

	testCryptoContext();

	testCollectionIds();

	testPublicKeys();

	testPrivateKeys();

	testPlaintext();

	testCiphertext();


	console.log("TESTS COMPLETED, HUZZAH!!");
}

if(process.argv.indexOf("--test") > -1){
	dataDirectory = './test_user_data/';
	testAll();
}

// testAll();
