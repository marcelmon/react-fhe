/*

ADD CHECK CANNOT GET DATA AFTE DELETE


mysqlConnect 		= function()
mysqlConnectQuery 	= function(query)


putCryptoContext 		= function(ccData, userId, cryptoContextId = null)
getAllCryptoContextIds 	= function(userId)
getCryptoContext 		= function(userId, cryptoContextId
deleteCryptoContext 	= function(userId, ccId)


putKeypair 			= function(pubkeydata, privkeydata, userId, ccId, keypairId = null)
getAllKeypairIds 	= function(userId, ccId)
getPublicKey 		= function(userId, ccId, keypairId)
getPrivateKey 		= function(userId, ccId, keypairId)
deleteKeypair 		= function(userId, ccId, keypairId)



putCollection 			= function(collectionName, userId, collectionId = null)
getAllCollectionIds		= function(userId)
getCollectionName 		= function(userId, collectionId)
getAllCollectionNames 	= function(userId)
deleteCollection 		= function(userId, collectionId)


// plaintext key-value pairs

// want to update database to allow unique keys ??and search on keys in plaintext??
putPlaintextKVPair 		= function(keyData, valueData, userId, collectionId, kvPairId = null)
deletePlaintextKVPair 	= function(userId, collectionId, kvPairId)

getAllPlaintextKVPairIds 		= function(userId, collectionId)
getPlaintextKeyValueData 		= function(userId, collectionId, kvPairId) // fetch one using the kvPairId
getAllPlaintextKeysValuesData 	= function(userId, collectionId) 		   // fetchall including the increment id

	getPlaintextKeyData 		= function(userId, collectionId, kvPairId)
	getAllPlaintextKeysData 	= function(userId, collectionId)
	getPlaintextValueData 		= function(userId, collectionId, kvPairId)
	getAllPlaintextValuesData 	= function(userId, collectionId)



// ciphertext key bits
putCiphertextKeyBitData 	= function(keyBitData, userId, collectionId, ccId, keypairId, kvPairId, bitId)
deleteCiphertextKeyBitData 	= function(userId, collectionId, ccId, keypairId, kvPairId, bitId)
getCiphertextKeyBitIds 		= function(userId, collectionId, ccId, keypairId, kvPairId) // can be used to see if a value was encrypted
getCiphertextKeyBitData 	= function(userId, collectionId, ccId, keypairId, kvPairId, bitId)


// ciphertex values
putCiphertextValueData 		= function(ctextValueData, userId, collectionId, ccId, keypairId, kvPairId)
deleteCiphertextValueData 	= function(userId, collectionId, ccId, keypairId, kvPairId)
getCiphertextValueData		= function(userId, collectionId, ccId, keypairId, kvPairId)

*/



var mysql 		= require('sync-mysql');
var fs 			= require('fs');
var filepath 	= require('path');
var shell 		= require('shelljs');

var host = 'localhost';
var user = 'root';
var password = '';
var database = 'sp_test';


var mysqlConnect = function(){

	return new mysql({
		host: host,
		user: user,
		password: password,
		database: database
	});

};

var mysqlConnectQuery = function(query){

	var conn = mysqlConnect();
	return conn.query(query);
	
}



// user_cryptocontext
// __________________



// getAllCryptoContextIds
// (
// 	IN userId INT
// )
var getAllCryptoContextIds = function(userId){
	var res = mysqlConnectQuery('call getAllCryptoContextIds('+userId+');'); 
	return res[0].map(function(row){ return row.id })
};



// getCryptoContext
// (
// 	IN userId INT, 
// 	IN ccId INT
// )
var getCryptoContext = function(userId, cryptoContextId){
	var res = mysqlConnectQuery('call getCryptoContext('+userId+','+cryptoContextId+');');
	if(res[0].length == 0){
		return null;
	}
	return res[0][0].cryptocontext;
};





// putCryptoContext
// (
// 	IN ccData BLOB, 
// 	IN userId INT, 
// 	INOUT ccId INT
// )
// want to consider doing this blod insert from file
var putCryptoContext = function(ccData, userId, cryptoContextId){
	cryptoContextId = (cryptoContextId == null || typeof cryptoContextId == 'undefined')? "NULL" : cryptoContextId;
	var res = mysqlConnectQuery('call putCryptoContext("'+ccData+'",'+userId+','+cryptoContextId+');');
	if(res[0].length == 0){
		return null;
	}
	return res[0][0].id;
};



// deleteCryptoContext
// (
// 	IN userId INT, 
// 	IN ccId INT
// )
var deleteCryptoContext = function(userId, ccId){
	mysqlConnectQuery('call deleteCryptoContext('+userId+','+ccId+');');
}



// keypairs
// __________________

// getKeypairIds
// (
// 	IN userId INT, 
// 	IN ccId INT
// )
var getAllKeypairIds = function(userId, ccId){
	var res = mysqlConnectQuery('call getAllKeypairIds('+userId+','+ccId+');'); 
	return res[0].map(function(row){ return row.id; });
}



// putKeypair
// (
// 	IN pubkeydata BLOB, 
// 	IN privkeydata BLOB, 
// 	IN userId INT, 
// 	IN ccId INT, 
// 	IN keypairId INT
// )
var putKeypair = function(pubkeydata, privkeydata, userId, ccId, keypairId){

	// convert to mysql format, should be using prepared statements
	pubkeydata 	= (pubkeydata 	== null || typeof pubkeydata 	== 'undefined') ? "NULL" : pubkeydata;
	privkeydata = (privkeydata 	== null || typeof privkeydata 	== 'undefined') ? "NULL" : privkeydata;
	keypairId 	= (keypairId 	== null || typeof keypairId 	== 'undefined') ? "NULL" : keypairId;

	var res;
	if(pubkeydata == null && privkeydata == null){
		return false;
	}
	if(pubkeydata == null){
		res = mysqlConnectQuery('call putKeypair(NULL,"'+privkeydata+'",'+userId +','+ccId+','+keypairId+');');
	}
	else if(privkeydata == null){
		res = mysqlConnectQuery('call putKeypair("'+pubkeydata+'",NULL,'+userId +','+ccId+','+keypairId+');');
	}
	else{
		res = mysqlConnectQuery('call putKeypair("'+pubkeydata+'","'+privkeydata+'",'+userId +','+ccId+','+keypairId+');'); 
	}
	if(res[0].length == 0){
		return null;
	}
	return res[0][0].id;
}



// getPublicKey
// (
// 	IN userId INT, 
// 	IN ccId INT, 
// 	IN keypairId INT
// )
var getPublicKey = function(userId, ccId, keypairId){
	var res = mysqlConnectQuery('call getPublicKey('+userId +','+ccId+','+keypairId+');');
	if(res[0].length == 0){
		return null;
	}
	return res[0][0].pubkey;
}

// getPrivateKey
// (
// 	IN userId INT, 
// 	IN ccId INT, 
// 	IN keypairId INT
// )
var getPrivateKey = function(userId, ccId, keypairId){
	var res = mysqlConnectQuery('call getPrivateKey('+userId +','+ccId+','+keypairId+');');
	if(res[0].length == 0){
		return null;
	}
	return res[0][0].privkey;
}

	


// deleteKeypair
// (
// 	IN userId INT,
// 	IN ccId INT, 
// 	IN keypairId INT
// )
var deleteKeypair = function(userId, ccId, keypairId){
	mysqlConnectQuery('call deleteKeypair('+userId +','+ccId+','+keypairId+');');
}





// user_collections
// __________________


// getAllCollectionIds
// (
// 	IN userId INT
// )
var getAllCollectionIds = function(userId){
	var res = mysqlConnectQuery('call getAllCollectionIds('+userId+');'); 
	return res[0].map(function(row){ return row.id; });
}


// putCollection
// (
// 	IN collectionName VARCHAR(256), 
// 	IN userId INT, 
// 	IN collectionId INT
// )
var putCollection = function(collectionName, userId, collectionId){
	collectionId 	= (collectionId == null || typeof collectionId == 'undefined')? "NULL" : collectionId;
	var res = mysqlConnectQuery('call putCollection("'+collectionName+'",'+userId+','+collectionId+");");
	if(res[0].length == 0){
		return null;
	}
	return res[0][0].id;
}


// getCollectionName
// (
// 	IN userId INT, 
// 	IN collectionId INT
// )
var getCollectionName = function(userId, collectionId){
	var res = mysqlConnectQuery('call getCollectionName('+userId+','+collectionId+');');
	if(res[0].length == 0){
		return null;
	}
	return res[0][0].name;
}


// getAllCollectionNames
// (
// 	IN userId INT
// )
var getAllCollectionNames = function(userId){
	var res = mysqlConnectQuery('call getAllCollectionNames('+userId+');');
	return res[0].map(function(row){ return {id: row.id, name: row.name }; });
}


// deleteCollection
// (
// 	IN userId INT, 
// 	IN collectionId INT
// )
var deleteCollection = function(userId, collectionId){
	mysqlConnectQuery('call deleteCollection('+userId+','+collectionId+');');
}






// user_collections_plaintext_key_values
// __________________




// getAllPlaintextKVPairIds
// (
// 	IN userId INT, 
// 	IN collectionId INT
// )
var getAllPlaintextKVPairIds = function(userId, collectionId){
	var res = mysqlConnectQuery('call getAllPlaintextKVPairIds('+userId+','+collectionId+');'); 
	return res[0].map(function(row){ return row.id; });
}



// getPlaintextKeyValueData
// (
// 	IN userId INT, 
// 	IN collectionId INT, 
// 	IN kvPairId INT
// )
var getPlaintextKeyValueData = function(userId, collectionId, kvPairId){
	var res = mysqlConnectQuery('call getPlaintextKeyValueData('+userId+','+collectionId+','+kvPairId+');');
	if(res[0].length == 0){
		return null;
	}
	return {key: res[0][0].key,  value: res[0][0].value};
}


// getAllPlaintextKeysValuesData
// (
// 	IN userId INT, 
// 	IN collectionId INT
// )
var getAllPlaintextKeysValuesData = function(userId, collectionId){
	var res = mysqlConnectQuery('call getAllPlaintextKeysValuesData('+userId+','+collectionId+');');
	return res[0].map(function(row){ return {id: row.id, key: row.key, value: row.value} ; });
}




	// getPlaintextKeyData
	// (
	// 	IN userId INT, 
	// 	IN collectionId INT, 
	// 	IN kvPairId INT
	// )
	var getPlaintextKeyData = function(userId, collectionId, kvPairId){
		var res = mysqlConnectQuery('call getPlaintextKeyData('+userId+','+collectionId+','+kvPairId+');');
		if(res[0].length == 0){
			return null;
		}
		return res[0][0].key;
	}


	// getAllPlaintextKeysData
	// (
	// 	IN userId INT, 
	// 	IN collectionId INT
	// )
	var getAllPlaintextKeysData = function(userId, collectionId){
		var res = mysqlConnectQuery('call getAllPlaintextKeysData('+userId+','+collectionId+');');
		return res[0].map(function(row){ return {id: row.id, key: row.key}; });
	}


	// getPlaintextValueData
	// (
	// 	IN userId INT, 
	// 	IN collectionId INT, 
	// 	IN kvPairId INT
	// )
	var getPlaintextValueData = function(userId, collectionId, kvPairId){
		var res = mysqlConnectQuery('call getPlaintextValueData('+userId+','+collectionId+','+kvPairId+');');
		if(res[0].length == 0){
			return null;
		}
		return res[0][0].value;
	}

	// getAllPlaintextValuesData
	// (
	// 	IN userId INT, 
	// 	IN collectionId INT
	// )
	var getAllPlaintextValuesData = function(userId, collectionId){
		var res = mysqlConnectQuery('call getAllPlaintextValuesData('+userId+','+collectionId+');');
		return res[0].map(function(row){ return {id: row.id, value: row.value}; });
	}



// putPlaintextKVPair
// (
// 	IN keyData VARCHAR(256), 
// 	IN valueData VARCHAR(256), 
// 	IN userId INT, 
// 	IN collectionId INT, 
// 	IN kvPairId INT
// )
var putPlaintextKVPair = function(keyData, valueData, userId, collectionId, kvPairId){
	kvPairId = (kvPairId == null || typeof kvPairId == 'undefined')? "NULL": kvPairId;
	var res = mysqlConnectQuery('call putPlaintextKVPair("'+keyData+'","'+valueData+'",'+userId+','+collectionId+','+kvPairId+");");
	if(res[0].length == 0){
		return null;
	}
	return res[0][0].id;
};



// deletePlaintextKVPair
// (
// 	IN userId INT, 
// 	IN collectionId INT, 
// 	IN kvPairId INT
// )
var deletePlaintextKVPair = function(userId, collectionId, kvPairId){
	mysqlConnectQuery('call deletePlaintextKVPair('+userId+','+collectionId+','+kvPairId+');');
}


// user_ciphertext_keys_bitwise
// __________________



// getCiphertextKeyBitIds
// (
// 	IN userId INT, 
// 	IN collectionId INT, 
// 	IN ccId INT, 
// 	IN keypairId INT, 
// 	IN kvPairId INT
// )
var getCiphertextKeyBitIds = function(userId, collectionId, ccId, keypairId, kvPairId){
	var res = mysqlConnectQuery('call getCiphertextKeyBitIds('+userId+','+collectionId+','+ccId+','+keypairId+','+kvPairId+');');
	return res[0].map(function(row){ return row.id; });
};


// getCiphertextKeyBitData 
// (
// 	IN userId INT, 
// 	IN collectionId INT, 
// 	IN ccId INT, 
// 	IN keypairId INT, 
// 	IN kvPairId INT, 
// 	IN bitId INT
// )
var getCiphertextKeyBitData = function(userId, collectionId, ccId, keypairId, kvPairId, bitId){
	console.log('call getCiphertextKeyBitData('+userId+','+collectionId+','+ccId+','+keypairId+','+kvPairId+','+bitId+');');
	var res = mysqlConnectQuery('call getCiphertextKeyBitData('+userId+','+collectionId+','+ccId+','+keypairId+','+kvPairId+','+bitId+');');
	if(res[0].length == 0){
		return null;
	}
	return res[0][0].bit_data;
}



// putCiphertextKeyBitData
// (
// 	IN keyBitData 	BLOB, 
// 	IN userId 		INT, 
// 	IN collectionId INT, 
// 	IN ccId 		INT, 
// 	IN keypairId 	INT, 
// 	IN kvPairId 	INT, 
// 	IN bitId 		INT
// )
var putCiphertextKeyBitData = function(keyBitData, userId, collectionId, ccId, keypairId, kvPairId, bitId){
	var res = mysqlConnectQuery('call putCiphertextKeyBitData("'+keyBitData+'",'+userId+','+collectionId+','+ccId+','+keypairId+','+kvPairId+','+bitId+');');
	if(res[0].length == 0){
		return null;
	}
	// console.log("put ctext key bit data res : ");

	return res[0][0].id;
}


// deleteCiphertextKeyBitData
// (
// 	IN userId 		INT, 
// 	IN collectionId INT, 
// 	IN ccId 		INT, 
// 	IN keypairId 	INT, 
// 	IN kvPairId 	INT, 
// 	IN bitId 		INT
// )
var deleteCiphertextKeyBitData = function(userId, collectionId, ccId, keypairId, kvPairId, bitId){
	console.log("the delete : ");
	console.log('call deleteCiphertextKeyBitData('+userId+','+collectionId+','+ccId+','+keypairId+','+kvPairId+','+bitId+');');
	mysqlConnectQuery('call deleteCiphertextKeyBitData('+userId+','+collectionId+','+ccId+','+keypairId+','+kvPairId+','+bitId+');');
}




// user_ciphertext_values
// __________________


// getCiphertextValueData
// (
// 	IN userId INT, 
// 	IN collectionId INT, 
// 	IN ccId INT, 
// 	IN keypairId INT, 
// 	IN kvPairId INT
// )
var getCiphertextValueData = function(userId, collectionId, ccId, keypairId, kvPairId){
	var res = mysqlConnectQuery('call getCiphertextValueData('+userId+','+collectionId+','+ccId+','+keypairId+','+kvPairId+');');
	if(res[0].length == 0){
		return null;
	}
	return res[0][0].value_data;
}

// putCiphertextValueData
// (
// 	IN ctextValueData 	BLOB, 
// 	IN userId 			INT, 
// 	IN collectionId 	INT, 
// 	IN ccId 			INT, 
// 	IN keypairId 		INT, 
// 	IN kvPairId 		INT
// )
var putCiphertextValueData = function(ctextValueData, userId, collectionId, ccId, keypairId, kvPairId){
	console.log("the put ctext query : ");
	console.log('call putCiphertextValueData("'+ctextValueData+'",'+userId+','+collectionId+','+ccId+','+keypairId+','+kvPairId+');');
	var res = mysqlConnectQuery('call putCiphertextValueData("'+ctextValueData+'",'+userId+','+collectionId+','+ccId+','+keypairId+','+kvPairId+');');
	if(res[0].length == 0){
		return null;
	}
	return res[0][0].id;
}


// deleteCiphertextValueData
// (
// 	IN userId INT, 
// 	IN collectionId INT, 
// 	IN ccId INT, 
// 	IN keypairId INT, 
// 	IN kvPairId INT
// )
var deleteCiphertextValueData = function(userId, collectionId, ccId, keypairId, kvPairId){
	mysqlConnectQuery('call deleteCiphertextValueData('+userId+','+collectionId+','+ccId+','+keypairId+','+kvPairId+');');
}




// testing:

var testUserId;

var assertTrue = function(val){
	if(!val){
		console.log("The error val was:");
		console.log(val);
		throw new Error('assert true error thrown')
	}
	return;
}





// testPut
// testAutoIncrement
// testUpdate
// testDelete
// testGetIds
// testGetOne
// testGetMany
// testGetMeta (ex: name)


var testCryptoContext = function(){

	// testGetIds
	// testPut
	// testAutoIncrement
	// testUpdate
	// testDelete
	// testGetOne

	// testGetIds
	assertTrue(getAllCryptoContextIds(testUserId).length == 0);

	var ccId_1 = 1;
	var ccId_2 = 2;

	// test put/test get
	assertTrue(!getCryptoContext(testUserId, ccId_1));
	assertTrue(putCryptoContext("cc data 1", testUserId, ccId_1) == ccId_1);
	assertTrue(getCryptoContext(testUserId, ccId_1) == "cc data 1");

	// testAutoIncrement/test get
	assertTrue(!getCryptoContext(testUserId, ccId_2));
	assertTrue(putCryptoContext("cc data 2", testUserId, null) == ccId_2); // test the auto increment feature
	assertTrue(getCryptoContext(testUserId, ccId_2) == "cc data 2");

	// test update/test get
	assertTrue(putCryptoContext("cc data 2.1", testUserId, ccId_2) == ccId_2);
	assertTrue(getCryptoContext(testUserId, ccId_2) == "cc data 2.1");
	
	// testGetIds
	var newAllCryptoContextIds = getAllCryptoContextIds(testUserId);
	assertTrue(newAllCryptoContextIds.length == 2);
	assertTrue(newAllCryptoContextIds.indexOf(ccId_1) > -1);
	assertTrue(newAllCryptoContextIds.indexOf(ccId_2) > -1);
	

	// test delete/test get ids/test get
	deleteCryptoContext(testUserId, ccId_1);
	var finalAllCryptoContextIds = getAllCryptoContextIds(testUserId);
	assertTrue(finalAllCryptoContextIds.length == 1);
	assertTrue(newAllCryptoContextIds.indexOf(ccId_2) > -1);
	assertTrue(getCryptoContext(testUserId, ccId_2) == 'cc data 2.1');
};

var testKeys = function(){


	// testGetIds
	// testPut
	// testAutoIncrement
	// testUpdateBothKeys
	// testDelete
	// testGetIds
	// testGetPublicKey
	// testGetPrivateKey


	var keyId_1 				= 1;
	var pubKeyData_1 			= "pubkey_1";
	var privKeyData_1 			= "privkey_1";

	var keyId_2 				= 2;
	var pubKeyData_2 			= "pubkey_2";
	var privKeyData_2 			= "privkey_2";

	var pubKeyData_2_update 	= "pubkey_2.1";
	var privKeyData_2_update 	= "privkey_2.1";

	var ccId_1 = 1;
	var ccId_2 = 2;

	// testGetIds
	assertTrue(getAllKeypairIds(testUserId, ccId_1).length == 0);

	// test put/test get public key/test get private key (id 1)
	assertTrue(!getPublicKey (testUserId, ccId_1, keyId_1));
	assertTrue(!getPrivateKey(testUserId, ccId_1, keyId_1));
	assertTrue(    putKeypair(pubKeyData_1, privKeyData_1, testUserId, ccId_1, keyId_1)	== keyId_1);

	// console.log("pub key ret 1:");
	// console.log(getPublicKey(testUserId, ccId_1, keyId_1));
	assertTrue(  getPublicKey(testUserId, ccId_1, keyId_1) 								== pubKeyData_1);
	// console.log("priv key ret 2:");
	// console.log(getPrivateKey(testUserId, ccId_1, keyId_1));
	assertTrue( getPrivateKey(testUserId, ccId_1, keyId_1)								== privKeyData_1);

	// testAutoIncrement/test get pulic key/ test get private key
	assertTrue(	!getPublicKey( testUserId, 	 ccId_1, 	keyId_2) );
	assertTrue(!getPrivateKey( testUserId, 	 ccId_1, 	keyId_2) );

	var updateKey2 = putKeypair( pubKeyData_2, privKeyData_2, testUserId, ccId_1, keyId_2);
	assertTrue(updateKey2 == keyId_2);
	// assertTrue(	   putKeypair( pubKeyData_1, privKeyData_2, testUserId, ccId_1, keyId_2) 	== keyId_2);
	assertTrue(  getPublicKey( testUserId, 	 ccId_1, 	keyId_2) 							== pubKeyData_2);
	assertTrue(	getPrivateKey( testUserId,	 ccId_1,	keyId_2) 							== privKeyData_2);

	// test update/test get
	assertTrue(		 putKeypair(pubKeyData_2_update, privKeyData_2_update, testUserId, ccId_1, keyId_2)	== keyId_2);
	assertTrue(  getPublicKey( testUserId, 	 ccId_1, 	keyId_2) 										== pubKeyData_2_update);
	assertTrue(	getPrivateKey( testUserId,	 ccId_1,	keyId_2) 										== privKeyData_2_update);
	
	// testGetIds
	var newAllKeypairIds = getAllKeypairIds(testUserId, ccId_1);
	assertTrue(newAllKeypairIds.length == 2);
	assertTrue(newAllKeypairIds.indexOf(keyId_1) > -1);
	assertTrue(newAllKeypairIds.indexOf(keyId_2) > -1);

	// test delete/test get ids/test get
	deleteKeypair(testUserId, ccId_1, keyId_1);
	assertTrue(!(getPrivateKey(testUserId, ccId_1, keyId_1)));
	assertTrue(!(getPublicKey(testUserId, ccId_1, keyId_1)));
	var finalAllKeypairIds = getAllKeypairIds(testUserId, ccId_1);
	assertTrue(finalAllKeypairIds.length == 1);
	assertTrue(finalAllKeypairIds.indexOf(keyId_2) > -1);
	assertTrue(getPublicKey(testUserId, ccId_1, keyId_2) == pubKeyData_2_update);
	assertTrue(getPrivateKey(testUserId, ccId_1, keyId_2) == privKeyData_2_update);

};

var testCollections = function(){


	// testGetIds
	// testPut
	// testAutoIncrement
	// testUpdate
	// testDelete
	// testGetIds
	// testGetNameOne
	// testGetIdNameAll


	var colId_1 			= 1;
	var colName_1 			= "name_1";
	var colId_2 			= 2;
	var colName_2 			= "name_2";
	var colName_2_update 	= "new_name_2";

	// testGetIds
	assertTrue(getAllCollectionIds(testUserId).length == 0);

	// test get all collection (id,name)s
	assertTrue(getAllCollectionNames(testUserId).length == 0);

	// test put/test get name one
	assertTrue(!getCollectionName(testUserId, colId_1));
	assertTrue(putCollection(colName_1, testUserId, colId_1) == colId_1);
	assertTrue(getCollectionName(testUserId, colId_1) == colName_1);

	// testAutoIncrement/test get
	assertTrue(!getCollectionName(testUserId, colId_2));
	assertTrue(putCollection(colName_2, testUserId, null) == colId_2); // test the auto increment feature
	assertTrue(getCollectionName(testUserId, colId_2) == colName_2);

	// test update/test get
	assertTrue(putCollection(colName_2_update, testUserId, colId_2) == colId_2);
	assertTrue(getCollectionName(testUserId, colId_2) == colName_2_update);
	
	// testGetIds
	var newAllCollectionIds = getAllCollectionIds(testUserId);
	assertTrue(newAllCollectionIds.length == 2);
	assertTrue(newAllCollectionIds.indexOf(colId_1) > -1);
	assertTrue(newAllCollectionIds.indexOf(colId_2) > -1);
	
	// check that both values appear in the get collection names (id,name) and only 2 returned
	var newAllColelctionIdNames = getAllCollectionNames(testUserId);
	assertTrue(newAllColelctionIdNames.length 	== 2);

	console.log(newAllColelctionIdNames);
	// assertTrue(false);
	// expected return : [{id:ccId_1, name:colName_1},{id:ccId_1, name:colName_1}]
	assertTrue(newAllColelctionIdNames[0].id 	== colId_1 				|| newAllColelctionIdNames[1].id 	== colId_1);
	assertTrue(newAllColelctionIdNames[0].name 	== colName_1 			|| newAllColelctionIdNames[1].name 	== colName_1);
	assertTrue(newAllColelctionIdNames[0].id 	== colId_2 				|| newAllColelctionIdNames[1].id 	== colId_2);
	assertTrue(newAllColelctionIdNames[0].name 	== colName_2_update 	|| newAllColelctionIdNames[1].name 	== colName_2_update);


	// test delete/test get ids/test get
	deleteCollection(testUserId, colId_1);
	var finalAllCollectionIds = getAllCollectionIds(testUserId);
	assertTrue(finalAllCollectionIds.length == 1);
	assertTrue(finalAllCollectionIds.indexOf(colId_2) > -1);
	assertTrue(getCollectionName(testUserId, colId_2) == colName_2_update);


	// check that only one values appears in the get collection names (id,name)
	var finalAllColelctionIdNames = getAllCollectionNames(testUserId);
	assertTrue(finalAllColelctionIdNames.length == 1);
	assertTrue(finalAllColelctionIdNames[0].id == colId_2);
	assertTrue(finalAllColelctionIdNames[0].name == colName_2_update);
};


var testPlaintext = function(){
	var colId_1 			= 1;
	var ptextId_1 			= 1;
	var ptextKeyData_1 		="ptext_key_1";
	var ptextValueData_1 	="ptext_value_1";
	var ptextId_2 			= 2;
	var ptextKeyData_2 		="ptext_key_2";
	var ptextValueData_2 	="ptext_value_2";
	var ptextKeyData_2_update 	="ptext_key_2.1";
	var ptextValueData_2_update ="ptext_value_2.1";

	// test get all kv pairs (id, key data, value data) -- only do get all of both key and value for now (wll be used to populate front end only)
	// test put kv pair 		-- using id
	// test update kv pair 		-- using id
	// test put autoincrement
	// test get all ids
	// test delete kvpair


	assertTrue(getAllPlaintextKVPairIds(testUserId, colId_1).length == 0);
	assertTrue(getAllPlaintextKeysValuesData(testUserId, colId_1).length == 0);
	assertTrue(getAllPlaintextKeysData(testUserId, colId_1).length == 0);

	// test put/get
	assertTrue(!getPlaintextValueData(testUserId, colId_1, ptextId_1));
	assertTrue(putPlaintextKVPair(ptextKeyData_1, ptextValueData_1, testUserId, colId_1, ptextId_1) == ptextId_1);
	assertTrue(getPlaintextKeyData(testUserId, colId_1, ptextId_1) 		== ptextKeyData_1);
	assertTrue(getPlaintextValueData(testUserId, colId_1, ptextId_1) 	== ptextValueData_1);


	// test auto increment/get
	assertTrue(!getPlaintextValueData(testUserId, colId_1, ptextId_2));
	assertTrue(putPlaintextKVPair(ptextKeyData_2, ptextValueData_2, testUserId, colId_1, null) == ptextId_2);
	assertTrue(getPlaintextKeyData(testUserId, colId_1, ptextId_2) 		== ptextKeyData_2);
	assertTrue(getPlaintextValueData(testUserId, colId_1, ptextId_2) 	== ptextValueData_2);


	// test update/get
	assertTrue(putPlaintextKVPair(ptextKeyData_2_update, ptextValueData_2_update, testUserId, colId_1, ptextId_2) == ptextId_2);
	assertTrue(getPlaintextKeyData(testUserId, colId_1, ptextId_2) 		== ptextKeyData_2_update);
	assertTrue(getPlaintextValueData(testUserId, colId_1, ptextId_2) 	== ptextValueData_2_update);

	// test get all key value pair data
	var newAllKVPairIds = getAllPlaintextKVPairIds(testUserId, colId_1, ptextId_1);
	assertTrue(newAllKVPairIds.length == 2);
	assertTrue(newAllKVPairIds.indexOf(ptextId_1) > -1);
	assertTrue(newAllKVPairIds.indexOf(ptextId_2) > -1);

	// test get all key value pair data
	var newAllKVPairsData = getAllPlaintextKeysValuesData(testUserId, colId_1);
	assertTrue(newAllKVPairsData.length == 2);
	// expect [{id:1, key:ptextKeyData_1, value:ptextValueData_1}, {id:2, key:ptextKeyData_2, value:ptextValueData_2}]
	// but maybe out of order
	var oneIndex;
	if(newAllKVPairsData[0].id == ptextId_1){
		oneIndex = 0;
	}
	else if(newAllKVPairsData[1].id == ptextId_1){
		oneIndex = 1;
	}
	else{
		assertTrue(false);
	}
	assertTrue(newAllKVPairsData[oneIndex].key == ptextKeyData_1 && newAllKVPairsData[oneIndex].value == ptextValueData_1);

	var twoIndex;
	if(newAllKVPairsData[0].id == ptextId_2){
		twoIndex = 0;
	}
	else if(newAllKVPairsData[1].id == ptextId_2){
		twoIndex = 1;
	}
	else{
		assertTrue(false);
	}
	assertTrue(newAllKVPairsData[twoIndex].key == ptextKeyData_2_update && newAllKVPairsData[twoIndex].value == ptextValueData_2_update);
	


	// test delete/test get ids/test get
	deletePlaintextKVPair(testUserId, colId_1, ptextId_1);

	var finalAllKVPairIds = getAllPlaintextKVPairIds(testUserId, colId_1);
	assertTrue(!getPlaintextKeyData(testUserId, colId_1, ptextId_1));
	assertTrue(finalAllKVPairIds.length == 1);
	assertTrue(finalAllKVPairIds.indexOf(ptextId_2) > -1);
	assertTrue(!(finalAllKVPairIds.indexOf(ptextId_1) > -1));
	assertTrue(getPlaintextKeyData(testUserId, colId_1, ptextId_2) 		== ptextKeyData_2_update);
	assertTrue(getPlaintextValueData(testUserId, colId_1, ptextId_2) 	== ptextValueData_2_update);

	var finalAllKVPairsData = getAllPlaintextKeysValuesData(testUserId, colId_1);
	assertTrue(finalAllKVPairsData.length 	== 1);
	assertTrue(finalAllKVPairsData[0].id 	== ptextId_2);
	assertTrue(finalAllKVPairsData[0].key 	== ptextKeyData_2_update);
	assertTrue(finalAllKVPairsData[0].value == ptextValueData_2_update);



}





var testCiphertextKeyBits = function(){

	var colId_1 = 1;
	var colId_2 = 2;

	var ccId_1 	= 1;
	var ccId_2 	= 2;

	var keyId_1 = 1;
	var keyId_2 = 2;

	var ptextId_1 = 1;
	var ptextId_2 = 2;

	var keyBitId_1 = 1;
	var keyBitId_2 = 2; 

	var keyBitData_ptext1_1 = "ptext_1_bit_1";
	var keyBitData_ptext1_2 = "ptext_1_bit_2";

	var keyBitData_ptext2_1 = "ptext_2_bit_1";
	var keyBitData_ptext2_2 = "ptext_2_bit_2";

	var keyBitData_ptext1_1_update = "ptext_1_bit_1.1";
	var keyBitData_ptext1_2_update = "ptext_1_bit_2.1";

	// test getIds empty
	assertTrue(getCiphertextKeyBitIds(testUserId, colId_1, ccId_1, keyId_1, ptextId_1).length == 0);

	// test put/get first
	assertTrue(!getCiphertextKeyBitData(testUserId, colId_1, ccId_1, keyId_1, ptextId_1, keyBitId_1));
	assertTrue(putCiphertextKeyBitData(keyBitData_ptext1_1, testUserId, colId_1, ccId_1, keyId_1, ptextId_1, keyBitId_1) == keyBitId_1);
	assertTrue(getCiphertextKeyBitData(testUserId, colId_1, ccId_1, keyId_1, ptextId_1, keyBitId_1) == keyBitData_ptext1_1);

	// test put new (cannot auto increment)
	assertTrue(!getCiphertextKeyBitData(testUserId, colId_1, ccId_1, keyId_1, ptextId_1, keyBitId_2));
	assertTrue(putCiphertextKeyBitData(keyBitData_ptext1_2, testUserId, colId_1, ccId_1, keyId_1, ptextId_1, keyBitId_2) == keyBitId_2);
	assertTrue(getCiphertextKeyBitData(testUserId, colId_1, ccId_1, keyId_1, ptextId_1, keyBitId_2) == keyBitData_ptext1_2);

	// test update/test get
	assertTrue(putCiphertextKeyBitData(keyBitData_ptext1_2_update, testUserId, colId_1, ccId_1, keyId_1, ptextId_1, keyBitId_2) == keyBitId_2);
	assertTrue(getCiphertextKeyBitData(testUserId, colId_1, ccId_1, keyId_1, ptextId_1, keyBitId_2) == keyBitData_ptext1_2_update);

	// test get all key value pair data
	var newAllCiphertextKeyBitIds = getCiphertextKeyBitIds(testUserId, colId_1, ccId_1, keyId_1, ptextId_1);
	assertTrue(newAllCiphertextKeyBitIds.length == 2);
	assertTrue(newAllCiphertextKeyBitIds.indexOf(keyBitId_1) > -1);
	assertTrue(newAllCiphertextKeyBitIds.indexOf(keyBitId_2) > -1);

	// test delete/test get ids/test get -- delete keybit_2
	deleteCiphertextKeyBitData(testUserId, colId_1, ccId_1, keyId_1, ptextId_1, keyBitId_2);
	var finalCiphertextKeyBitIds = getCiphertextKeyBitIds(testUserId, colId_1, ccId_1, keyId_1, ptextId_1);
	assertTrue(finalCiphertextKeyBitIds.length == 1);
	assertTrue(finalCiphertextKeyBitIds.indexOf(keyBitId_1) > -1);
	assertTrue(getCiphertextKeyBitData(testUserId, colId_1, ccId_1, keyId_1, ptextId_1, keyBitId_1) == keyBitData_ptext1_1);
};

var testCiphertextValues = function(){

	var colId_1 = 1;
	var colId_2 = 2;

	var ccId_1 	= 1;
	var ccId_2 	= 2;

	var keyId_1 = 1;
	var keyId_2 = 2;

	var ptextId_1 = 1;
	var ptextId_2 = 2;

	var keyBitId_1 = 1;
	var keyBitId_2 = 2; 

	var valueData_ptext1_1 = "ptext_1_value_1";
	var valueData_ptext1_2 = "ptext_1_value_2";

	var valueData_ptext2_1 = "ptext_2_value_1";
	var valueData_ptext2_2 = "ptext_2_value_2";

	var valueData_ptext1_1_update = "ptext_1_value_1.1";
	var valueData_ptext1_2_update = "ptext_1_value_2.1";

	// test get first
	assertTrue(!getCiphertextValueData(testUserId, colId_1, ccId_1, keyId_1, ptextId_1));
	assertTrue(putCiphertextValueData(valueData_ptext1_1, testUserId, colId_1, ccId_1, keyId_1, ptextId_1) == ptextId_1);
	assertTrue(getCiphertextValueData(testUserId, colId_1, ccId_1, keyId_1, ptextId_1) == valueData_ptext1_1);

	// test put second (there is no auto increment, reutrn id is always the one put, reutnred for error checking)
	assertTrue(!getCiphertextValueData(testUserId, colId_1, ccId_1, keyId_1, ptextId_2));
	assertTrue(putCiphertextValueData(valueData_ptext1_2, testUserId, colId_1, ccId_1, keyId_1, ptextId_2) == ptextId_2);
	assertTrue(getCiphertextValueData(testUserId, colId_1, ccId_1, keyId_1, ptextId_2) == valueData_ptext1_2);

	// test update/get
	assertTrue(putCiphertextValueData(valueData_ptext1_2_update, testUserId, colId_1, ccId_1, keyId_1, ptextId_2) == ptextId_2);
	assertTrue(getCiphertextValueData(testUserId, colId_1, ccId_1, keyId_1, ptextId_2) == valueData_ptext1_2_update);

	// test delete
	deleteCiphertextValueData(testUserId, colId_1, ccId_1, keyId_1, ptextId_1);
	assertTrue(!getCiphertextValueData(testUserId, colId_1, ccId_1, keyId_1, ptextId_1));
	assertTrue(getCiphertextValueData(testUserId, colId_1, ccId_1, keyId_1, ptextId_2) == valueData_ptext1_2_update);

};

var testAll = function(){

	testCryptoContext();

	testKeys();

	testCollections();

	testPlaintext();

	testCiphertextKeyBits();

	testCiphertextValues();

	console.log("TESTS COMPLETED, HUZZAH!!");
}




var mysqlConnectNoDatabase = function(){
	return new mysql({
		host: host,
		user: user,
		password: password
	});

};

var mysqlConnectQueryNoDatabase = function(query){
	var conn = mysqlConnectNoDatabase();
	return conn.query(query);
}



var dropCreateTestDatabase = function(){
	var databaseFile = './user_data_database.sql';
	if(!fs.existsSync(databaseFile)){
		assertTrue(false);
	}

	var dropTestDatabse = "mysql -u "+user+" -p'"+password+"' -e 'drop database if exists "+database+";';";
	// Run external tool synchronously
	console.log("the drop : "+ dropTestDatabse);
	if (shell.exec(dropTestDatabse).code !== 0) {
		console.log("ERROR IN DROP");
		return;
	}

	var createTestDatabse= "mysql -u "+user+" -p'"+password+"' -e 'create database "+database+"';";
	console.log("the create db : "+ createTestDatabse);
	if (shell.exec(createTestDatabse).code !== 0) {
		console.log("ERROR IN CREATE DB");
		return;
	}

	var createTestDatabseTables = "mysql -u "+user+" -p'"+password+"' " + database+" < ./user_data_database.sql;";
	console.log("the create db tables and procedures: "+ createTestDatabseTables);
	if (shell.exec(createTestDatabseTables).code !== 0) {
		console.log("ERROR IN CREATE DB TABLES AND PROCEDURES");
		return;
	}
	// mysqlConnectQueryNoDatabase("drop database if exists `"+database+"`;");
	// mysqlConnectQueryNoDatabase("create database `"+database+"`;");
	// mysqlConnectQueryNoDatabase(fs.readFileSync(databaseFile, 'utf8'));
}

var dropTestDatabase = function(){
	mysqlConnectQueryNoDatabase("drop database if exists `"+database+"`;");
};



if(process.argv.indexOf("--test") > -1){
	// dataDirectory = './test_user_data/';
	database = 'fhe_test';
	testUserId = '666';
	dropCreateTestDatabase();
	testAll();
}

