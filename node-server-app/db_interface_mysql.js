/*
mysqlConnect = function()
mysqlConnectQuery = function(query)


putCryptoContext 		= function(ccData, userId, cryptoContextId = null)
getCryptoContextIds 	= function(userId) 							<< CHANGE NAME to getAllCryptoContextIds
getCryptoContext 		= function(userId, cryptoContextId
deleteCryptoContext 	= function(userId, ccId)


putKeypair 		= function(pubkeydata, privkeydata, userId, ccId, keypairId = null)
getKeypairIds 	= function(userId, ccId) 											<< CHANGE NAME to getAllKeypairIds
getPublicKey 	= function(userId, ccId, keypairId)
getPrivateKey 	= function(userId, ccId, keypairId)
deleteKeypair 	= function(userId, ccId, keypairId)



// add getCollectionName() + getAllCollectionNames()
putCollection 			= function(collectionName, userId, collectionId = null)
getCollectionIds		= function(userId) 										<< CHANGE NAME to getAllCollectionIds
deleteCollection 		= function(userId, collectionId)




// plaintext key-value pairs

// want to update database to allow unique keys ??and search on keys in plaintext??
putPlaintextKVPair 		= function(keyData, valueData, userId, collectionId, kvPairId = null)
deletePlaintextKVPair 	= function(userId, collectionId, kvPairId)

getPlaintextKVPairIds 			= function(userId, collectionId)								<< CHANGE NAME to getAllPlaintextKVPairIds
getPlaintextKeyValueData 		= function(userId, collectionId, kvPairId) // fetch one using the kvPairId
getAllPlaintextKeysValuesData 	= function(userId, collectionId) 		   // fetchall including the increment id

	getPlaintextKeyData 		= function(userId, collectionId, kvPairId)
	getAllPlaintextKeysData 	= function(userId, collectionId)
	getPlaintextValueData 		= function(userId, collectionId, kvPairId)
	getAllPlaintextValuesData 	= function(userId, collectionId)



// ciphertext key bits

// add deleteCiphertextKeyBitData()
getCiphertextKeyBitIds 		= function(userId, collectionId, ccId, keypairId, kvPairId) // can be used to see if a value was encrypted
getCiphertextKeyBitData 	= function(userId, collectionId, ccId, keypairId, kvPairId, bitId)
putCiphertextKeyBitData 	= function(keyBitData, userId, collectionId, ccId, keypairId, kvPairId, bitId)



// ciphertex values

// add deleteCiphertextValueData()
getCiphertextValueData	= function(userId, collectionId, ccId, keypairId, kvPairId)
putCiphertextValueData 	= function(ctextValueData, userId, collectionId, ccId, keypairId, kvPairId)
*/



var mysql = require('sync-mysql');


var mysqlConnect = function(){

	return new mysql({
		host: 'localhost',
		user: 'root',
		password: 'StupidPaSs*%',
		database: 'sp_test'
	});

};

var mysqlConnectQuery = function(query){

	var conn = mysqlConnect();
	return conn.query(query);
	
}



// user_cryptocontext
// __________________



// getCryptoContextIds
// (
// 	IN userId INT
// )
var getCryptoContextIds = function(userId){
	var res = mysqlConnectQuery('call getCryptoContextIds('+userId+');'); 
	return res[0].map(function(row){ return row.id })
};



// getCryptoContext
// (
// 	IN userId INT, 
// 	IN ccId INT
// )
var getCryptoContext = function(userId, cryptoContextId){
	var res = mysqlConnectQuery('call getCryptoContext('+userId+','+cryptoContextId+');'); 
	return res[0][0].cryptocontext;
};





// putCryptoContext
// (
// 	IN ccData BLOB, 
// 	IN userId INT, 
// 	INOUT ccId INT
// )
// want to consider doing this blod insert from file
var putCryptoContext = function(ccData, userId, cryptoContextId = null){
	cryptoContextId = (cryptoContextId == null)? "NULL" : null;
	var res = mysqlConnectQuery('call putCryptoContext("'+ccData+'",'+userId+','+cryptoContextId+');'); 
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
var getKeypairIds = function(userId, ccId){
	var res = mysqlConnectQuery('call getKeypairIds('+userId+','+ccId+');'); 
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
var putKeypair = function(pubkeydata, privkeydata, userId, ccId, keypairId = null){

	// convert to mysql format, should be using prepared statements
	pubkeydata 	= (pubkeydata == null)	? "NULL" : null;
	privkeydata = (privkeydata == null)	? "NULL" : null;
	keypairId 	= (keypairId == null)	? "NULL" : null;

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
	return res[0][0].pubkey;
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


// getCollectionIds
// (
// 	IN userId INT
// )
var getCollectionIds = function(userId){
	var res = mysqlConnectQuery('call getCollectionIds('+userId+');'); 
	return res[0].map(function(row){ return row.id; });
}


// putCollection
// (
// 	IN collectionName VARCHAR(256), 
// 	IN userId INT, 
// 	IN collectionId INT
// )
var putCollection = function(collectionName, userId, collectionId = null){
	collectionId 	= (collectionId == null)	? "NULL" : null;
	var res = mysqlConnectQuery('call putCollection("'+collectionName+'",'+userId+','+collectionId);
	return res[0][0].id;
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




// getPlaintextKVPairIds
// (
// 	IN userId INT, 
// 	IN collectionId INT
// )
var getPlaintextKVPairIds = function(userId, collectionId){
	var res = mysqlConnectQuery('call getPlaintextKVPairIds('+userId+','+collectionId+');'); 
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
		return res[0][0].key;
	}


	// getAllPlaintextKeysData
	// (
	// 	IN userId INT, 
	// 	IN collectionId INT
	// )
	var getAllPlaintextKeysData = function(userId, collectionId){
		var res = mysqlConnectQuery('call getAllPlaintextKeysData('+userId+','+collectionId+');');
		return res[0].map(function(row){ return {id: row.id, key: row.key; });
	}


	// getPlaintextValueData
	// (
	// 	IN userId INT, 
	// 	IN collectionId INT, 
	// 	IN kvPairId INT
	// )
	var getPlaintextValueData = function(userId, collectionId, kvPairId){
		var res = mysqlConnectQuery('call getPlaintextValueData('+userId+','+collectionId+','+kvPairId+');');
		return res[0][0].value;
	}

	// getAllPlaintextValuesData
	// (
	// 	IN userId INT, 
	// 	IN collectionId INT
	// )
	var getAllPlaintextValuesData = function(userId, collectionId){
		var res = mysqlConnectQuery('call getAllPlaintextValuesData('+userId+','+collectionId+');');
		return res[0].map(function(row){ return {id: row.id, value: row.value; });
	}



// putPlaintextKVPair
// (
// 	IN keyData VARCHAR(256), 
// 	IN valueData VARCHAR(256), 
// 	IN userId INT, 
// 	IN collectionId INT, 
// 	IN kvPairId INT
// )
var putPlaintextKVPair = function(keyData, valueData, userId, collectionId, kvPairId = null){
	kvPairId = (kvPairId == null)?	"NULL":	kvPairId;
	var res = mysqlConnectQuery('call putPlaintextKVPair("'+keyData+'","'+valueData+'",'+userId+','+collectionId+','+kvPairId+");");
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
	return res.map(function(row){ return row.id; });
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
	var res = mysqlConnectQuery('call getCiphertextKeyBitData('+userId+','+collectionId+','+ccId+','+keypairId+','+kvPairId+','+bitId+');');
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
	mysqlConnectQuery('call putCiphertextKeyBitData('+keyBitData+','+userId+','+collectionId+','+ccId+','+keypairId+','+kvPairId+','+bitId+');');
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
	mysqlConnectQuery('call putCiphertextValueData('+ctextValueData+','+userId+','+collectionId+','+ccId+','+keypairId+','+kvPairId+');');
}





