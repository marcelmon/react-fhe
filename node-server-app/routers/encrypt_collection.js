var express = require('express');
var router 	= express.Router();

var dbInterface 	= require('../db_interface_mysql.js');
var fheInterface 	= require('../fhe_interface_pyServer.js');


var getMostRecentCC = function(userId){
	var ccIds = dbInterface.getAllCryptoContextIds(userId);
	if(!ccIds || ccIds.length == 0){
		return false;
	}
	var ccData = dbInterface.getCryptoContext(userId, ccIds[0]);
	if(!ccData){
		return false;
	}
	return {ccId: ccIds[0], ccData: ccData};
};



var generateAndPutNewCryptoContext = function(userId){
	var ccData = fheInterface.generateCryptoContext();
	var ccId;
	if(!ccData){
		return false;
	}
	ccId = dbInterface.putCryptoContext(ccData, userId, null);
	if(!ccId){
		return false;
	}
	return {ccId: ccId, ccData: ccData};
}


var getMostRecentKeypair = function(userId, ccId){
	var keypairIds = dbInterface.getAllKeypairIds(userId, ccId);
	if(!keypairIds || keypairIds.length == 0){
		return false;
	}
	var publicKey = dbInterface.getPublicKey(userId, ccId, keypairIds[0]);
	if(!publicKey){
		return false;
	}
	var privateKey = dbInterface.getPrivateKey(userId, ccId, keypairIds[0]);
	if(!privateKey){
		return false;
	}
	return {keyId: keypairIds[0], publicKey: publicKey, privateKey: privateKey};
};


// also requires updating the cryptocontext to allow eval mult keys
var generateAndPutNewKeypair = function(userId, ccId, ccData){
	var keyPairAndCCData = fheInterface.keygen(ccData); // pubkey, privkey
	if(!keyPairAndCCData){
		return false;
	}
	var publickey 	= keyPairAndCCData.publickey;
	var privatekey 	= keyPairAndCCData.privatekey;
	var newCCData 	= keyPairAndCCData.cryptocontext;
	

	var keyId 	= dbInterface.putKeypair(publickey, privatekey, userId, ccId, null);
	if(!keyId){
		return false;
	}
	// update the cryptocontext with the eval mult keys
	ccId = dbInterface.putCryptoContext(newCCData, userId, ccId);
	if(!ccId){
		return false;
	}
	
	return {ccData: newCCData, keyId: keyId, publickey: publickey, privatekey: privatekey};
}


var getFlattenedBits = function(inputString){
	var allBits = [];
	inputString.split('').forEach(function(character){
		character.charCodeAt(0).toString(2).split('').forEach(function(bitAsChar){
			allBits.push(parseInt(bitAsChar, 2));
		});
	});
	return allBits;
}


// add with auto increment
router.post('/:userId/:colId/encrypt_all/', function(req, res){

	var ccRet = getMostRecentCC(req.params.userId);
	if(!ccRet){
		ccRet = generateAndPutNewCryptoContext(req.params.userId);
		if(!ccRet){
			res.status(500).send('Something broke in encrypt all. Could not generate and put new cc!');
			return;
		}
	}
	var ccId = ccRet.ccId;
	var ccData = ccRet.ccData;

	var keyRet = getMostRecentKeypair(req.params.userId, ccId);
	if(!keyRet){
		keyRet = generateAndPutNewKeypair(req.params.userId, ccId, ccData);
		if(!keyRet){
			res.status(500).send('Something broke in encrypt all. Could not generate and put new keypair!');
			return;
		}
		ccData = keyRet.ccData;
	}
	var keyId 		= keyRet.keyId;
	var publickey 	= keyRet.publickey;
	var privatekey 	= keyRet.privateKey;

	var allPtextIdsKeysAndValues = dbInterface.getAllPlaintextKeysValuesData(req.params.userId, req.params.colId);
	if(!allPtextIdsKeysAndValues){
		res.status(500).send('Something broke in encrypt all could not get ptext ids!');
		return;
	}
	else if(allPtextIdsKeysAndValues.length == 0){
		res.status(500).send('Something broke in encrypt all. No plaintext in collection!');
		return;
	}
	else{
		for (var i = 0; i < allPtextIdsKeysAndValues.length; i++) {

			// need to encrypt each key bitwise, insert into db, and encrypt each value bitwise
			var kvPairId = allPtextIdsKeysAndValues[i].id;
			var keyBits = getFlattenedBits(allPtextIdsKeysAndValues[i].key);
			for (var bitId = 0; bitId < keyBits.length; bitId++) {
				
				var encryptedBit = fheInterface.encrypt(ccData, publickey, keyBits[bitId].toString());
				dbInterface.putCiphertextKeyBitData(encryptedBit, req.params.userId, req.params.colId, ccId, keyId, kvPairId, bitId);

			};
			// encrypt the value
			var encryptedValue = fheInterface.encrypt(ccData, publickey, allPtextIdsKeysAndValues[i].value);
			dbInterface.putCiphertextValueData(encryptedValue, req.params.userId, req.params.colId, ccId, keyId, kvPairId);
		};
		res.setHeader('Content-Type', 'application/json');
	    res.send(JSON.stringify(true));
	}
});



module.exports = router;