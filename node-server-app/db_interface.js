var impl = require('./db_interface_FILE.js');





var getAllCryptoContextIds = function(userId){
	return impl.getAllCryptoContextIds(userId);
};

var getAllPublicKeyIds = function(userId, cryptoContextId){
	return impl.getAllPublicKeyIds(userId, cryptoContextId);
};

var getAllPrivateKeyIds = function(userId, cryptoContextId){
	return impl.getAllPrivateKeyIds(userId, cryptoContextId);
};

var getAllCollectionIds = function(userId){
	return impl.getAllCollectionIds(userId);
};

var getAllPlaintextIds = function(userId, collectionId){
	return impl.getAllPlaintextIds(userId, collectionId);
};

var getAllCiphertextIds = function(userId, collectionId, cryptoContextId, keyPairId){
	return impl.getAllCiphertextIds(userId, collectionId, cryptoContextId, keyPairId);
};


	var getAllCiphertextKeyBitIds = function(userId, collectionId, cryptoContextId, keyPairId, plaintextId){
		return impl.getAllCiphertextKeyBitIds(userId, collectionId, cryptoContextId, keyPairId, plaintextId);
	};







var getCryptoContext = function(userId, cryptoContextId){
	return impl.getCryptoContext(userId, cryptoContextId);
};

// always a private public keypair, but here we must relate, '/keyPairs/publickey/'+{id}.txt
// 		{id} is the same for the public private keypair
// this is required
var getPublicKey = function(userId, cryptoContextId, keyPairId){
	return impl.getPublicKey(userId, cryptoContextId, keyPairId);
};

var getPrivateKey = function(userId, cryptoContextId, keyPairId){
	return impl.getPrivateKey(userId, cryptoContextId, keyPairId);
};

var getPlaintext = function(userId, collectionId, plaintextId){
	return impl.getPlaintext(userId, collectionId, plaintextId);
};

var getPlaintextKey = function(userId, collectionId, plaintextId){
	return impl.getPlaintext(userId, collectionId, plaintextId);
};

var getCiphertext = function(userId,  collectionId, cryptoContextId, keyPairId, plaintextId){
	return impl.getCiphertext(userId, collectionId, cryptoContextId, keyPairId, plaintextId);
};


	var getCiphertextKeyBit = function(userId,  collectionId, cryptoContextId, keyPairId, plaintextId, bitId){
		return impl.getCiphertextKeyBit(userId, collectionId, cryptoContextId, keyPairId, plaintextId, bitId);
	};

	var getCiphertextValue = function(userId,  collectionId, cryptoContextId, keyPairId, plaintextId){
		return impl.getCiphertextKeyBit(userId, collectionId, cryptoContextId, keyPairId, plaintextId);
	};






var addNewCollection = function(userId, collectionId = null, collectionName = null){
	return impl.addNewCollection(userId, collectionId);
}



var putCryptoContext 	= function(dataString, userId, cryptoContextId = null){
	return impl.putCryptoContext(dataString, userId, cryptoContextId);
}

var putPublicKey 		= function(dataString, userId, cryptoContextId, keyPairId = null){
	return impl.putPublicKey(dataString, userId, cryptoContextId, keyPairId);
}

var putPrivateKey 		= function(dataString, userId, cryptoContextId,	keyPairId = null){
	return impl.putPrivateKey(dataString, userId, cryptoContextId,	keyPairId);
}

var putPlaintext 		= function(dataString, userId, collectionId,	plaintextId){
	return impl.putPlaintext(dataString, userId, collectionId,	plaintextId);
}

	var putPlaintextKVPair 		= function(keyData, valueData, userId, collectionId,	plaintextId = null){
		return impl.putPlaintext(dataString, userId, collectionId,	plaintextId);
	}

var putCiphertext 		= function(dataString, 	userId, collectionId, cryptoContextId, keyPairId, plaintextId = null){
	return impl.putCiphertext(dataString, 	userId, collectionId, cryptoContextId, keyPairId, plaintextId);
}

	var putCiphertextKeyBit	= function(dataString, 	userId, collectionId, cryptoContextId, keyPairId, plaintextId, bitId){
		return impl.putCiphertextKeyBit(dataString, 	userId, collectionId, cryptoContextId, keyPairId, plaintextId);
	}

	var putCiphertextValue	= function(dataString, 	userId, collectionId, cryptoContextId, keyPairId, plaintextId){
		return impl.putCiphertextValue(dataString, 	userId, collectionId, cryptoContextId, keyPairId, plaintextId);
	}




module.exports = {
	getAllCryptoContextIds: getAllCryptoContextIds,
	getAllPublicKeyIds: 	getAllPublicKeyIds,
	getAllPrivateKeyIds: 	getAllPrivateKeyIds,
	getAllCollectionIds: 	getAllCollectionIds,
	getAllPlaintextIds: 	getAllPlaintextIds,
	getAllCiphertextIds: 	getAllCiphertextIds,

	getCryptoContext: 		getCryptoContext,
	getPublicKey: 			getPublicKey,
	getPrivateKey: 			getPrivateKey,
	getPlaintext: 			getPlaintext,
	getCiphertext: 			getCiphertext,

	addNewCollection: 		addNewCollection,
	putCryptoContext: 		putCryptoContext,
	putPublicKey: 			putPublicKey,
	putPrivateKey: 			putPrivateKey,
	putPlaintext: 			putPlaintext,
	putCiphertext: 			putCiphertext
};