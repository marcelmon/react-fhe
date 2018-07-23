var mysql = require('sync-mysql');




var mysqlConnect = function(){

	return new MySql({
		host: 'localhost',
		user: 'me',
		password: 'secret',
		database: 'the_app_database'
	});

};

var mysqlConnectQuery = function(query){

	var conn = mysqlConnect();
	return conn.query(query);
	
}



// user_cryptocontext
// __________________

var getAllCryptoContextIds = function(userId){
	var res = mysqlConnectQuery('call getCryptoContextIds("'+userId+'");'); 
	var retArray = [];
	res.forEach(function(value){
		retArray.push(value[0]);
	});
	return retArray;
};
// getCryptoContextIds
// (
// 	IN userId INT
// )




getCryptoContext
(
	IN userId INT, 
	IN ccId INT
)



putCryptoContext
(
	IN ccData BLOB, 
	IN userId INT, 
	INOUT ccId INT
)




deleteCryptoContext
(
	IN userId INT, 
	IN ccId INT
)




// keypairs
// __________________

getKeypairIds
(
	IN userId INT, 
	IN ccId INT
)




putKeypair
(
	IN pubkeydata BLOB, 
	IN privkeydata BLOB, 
	IN userId INT, 
	IN ccId INT, 
	IN keypairId INT
)




getPublicKey
(
	IN userId INT, 
	IN ccId INT, 
	IN keypairId INT
)


getPrivateKey
(
	IN userId INT, 
	IN ccId INT, 
	IN keypairId INT
)

	


deleteKeypair
(
	IN userId INT,
	IN ccId INT, 
	IN keypairId INT
)







// user_collections
// __________________


getCollectionIds
(
	IN userId INT
)



putCollection
(
	IN collectionName VARCHAR(256), 
	IN userId INT, 
	IN collectionId INT, 
	OUT LID INT
)



deleteCollection
(
	IN userId INT, 
	IN collectionId INT
)







// user_collections_plaintext_key_values
// __________________




getPlaintextKVPairIds
(
	IN userId INT, 
	IN collectionId INT
)



getPlaintextKeyValueData
(
	IN userId INT, 
	IN collectionId INT, 
	IN kvPairId INT
)



getAllPlaintextKeysValuesData
(
	IN userId INT, 
	IN collectionId INT
)




	getPlaintextKeyData
	(
		IN userId INT, 
		IN collectionId INT, 
		IN kvPairId INT
	)


	getAllPlaintextKeysData
	(
		IN userId INT, 
		IN collectionId INT
	)



	getPlaintextValueData
	(
		IN userId INT, 
		IN collectionId INT, 
		IN kvPairId INT
	)
	

	getAllPlaintextValuesData
	(
		IN userId INT, 
		IN collectionId INT
	)




putPlaintextKVPair
(
	IN keyData VARCHAR(256), 
	IN valueData VARCHAR(256), 
	IN userId INT, 
	IN collectionId INT, 
	IN kvPairId INT,
	OUT LID INT
)




deletePlaintextKVPair
(
	IN userId INT, 
	IN collectionId INT, 
	IN kvPairId INT
)



// user_ciphertext_keys_bitwise
// __________________



getCiphertextKeyBitIds
(
	IN userId INT, 
	IN collectionId INT, 
	IN ccId INT, 
	IN keypairId INT, 
	IN kvPairId INT
)



getCiphertextKeyBitData 
(
	IN userId INT, 
	IN collectionId INT, 
	IN ccId INT, 
	IN keypairId INT, 
	IN kvPairId INT, 
	IN bitId INT
)




putCiphertextKeyBitData
(
	IN keyBitData 	BLOB, 
	IN userId 		INT, 
	IN collectionId INT, 
	IN ccId 		INT, 
	IN keypairId 	INT, 
	IN kvPairId 	INT, 
	IN bitId 		INT

)





// user_ciphertext_values
// __________________


getCiphertextValueData
(
	IN userId INT, 
	IN collectionId INT, 
	IN ccId INT, 
	IN keypairId INT, 
	IN kvPairId INT
)


putCiphertextValueData
(
	IN ctextValueData 	BLOB, 
	IN userId 			INT, 
	IN collectionId 	INT, 
	IN ccId 			INT, 
	IN keypairId 		INT, 
	IN kvPairId 		INT
)






