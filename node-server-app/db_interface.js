var impl = require('db_interface_FILE.js');



// also do add (don't pass the data id, will return via auto increment or false if failed)

var putCryptoContext = function(serializedCC, uid, ccId){
	return impl.putData('cryptocontext', serializedCC, uid, ccId);
};


var getCryptoContext = function(uid, ccId){
	return impl.getData('cryptocontext', uid, ccId);
};


var putPlaintext = function(plaintext, uid, plaintextId, collectionId){
	return impl.putData('plaintext', plaintext, uid, plaintextId, collectionId);
};


var getPlaintext = function(uid, plaintextId, collectionId){
	return impl.getData('plaintext', uid, plaintextId, collectionId);
};

var putCiphertext = function(plaintext, uid, plaintextId, collectionId, cryptocontextId){
	return impl.putData('ciphertext', plaintext, uid, plaintextId, collectionId, cryptocontextId);
};


var getCiphertext = function(uid, plaintextId, collectionId, cryptocontextId){
	return impl.getData('ciphertext', uid, plaintextId, collectionId, cryptocontextId);
};