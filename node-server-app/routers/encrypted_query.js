const request = require('sync-request');


var fhePyURL = "http://localhost:8082";


var express = require('express');
var router 	= express.Router();

var dbInterface 	= require('../db_interface_mysql.js');
var fheInterface 	= require('../fhe_interface_pyServer.js');



var getFlattenedBits = function(inputString){
	var allBits = [];
	inputString.split('').forEach(function(character){
		character.charCodeAt(0).toString(2).split('').forEach(function(bitAsChar){
			allBits.push(parseInt(bitAsChar, 2));
		});
	});
	return allBits;
}


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

var getMostRecentKeypair = function(userId, ccId){
	var keypairIds = dbInterface.getAllKeypairIds(userId, ccId);
	if(!keypairIds || keypairIds.length == 0){
		return false;
	}
	var publickey = dbInterface.getPublicKey(userId, ccId, keypairIds[0]);
	if(!publickey){
		return false;
	}
	var privatekey = dbInterface.getPrivateKey(userId, ccId, keypairIds[0]);
	if(!privatekey){
		return false;
	}
	return {keyId: keypairIds[0], publickey: publickey, privatekey: privatekey};
};

// add with auto increment
router.post('/:userId/:colId/query/:queryString/', function(req, res){


	console.log("type of userId : ");
	console.log((typeof req.params.userId));
	// first make new query
	var queryId 	= dbInterface.putQuery(req.params.userId, null);
	var queryBits 	= getFlattenedBits(req.params.queryString);

	var recentCC 		= getMostRecentCC(req.params.userId);
	var recentKeyPair 	= getMostRecentKeypair(req.params.userId, recentCC.ccId);

	var serializedCCString 			= recentCC.ccData;
	var serializedPublicKeyString 	= recentKeyPair.publickey;

	if(Buffer.isBuffer(serializedCCString)){
		serializedCCString = serializedCCString.toString('utf8');
	}

	if(Buffer.isBuffer(serializedPublicKeyString)){
		serializedPublicKeyString = serializedPublicKeyString.toString('utf8');
	}
	for (var bitId = 0; bitId < queryBits.length; bitId++) {
		
		var encryptedQueryBitData = fheInterface.encryptInt(serializedCCString, serializedPublicKeyString, queryBits[bitId]);

		var bitIdnew = dbInterface.putQueryBitData(req.params.userId, queryId, bitId+1, encryptedQueryBitData);
		
	}

	// need to pad with 0s
	for (var bitId2 = queryBits.length; bitId2 < 8; bitId2++) {

		var encryptedQueryBitData = fheInterface.encryptInt(serializedCCString, serializedPublicKeyString, 0);
		var bitIdnew = dbInterface.putQueryBitData(req.params.userId, queryId, bitId2+1, encryptedQueryBitData);
	}
	// dbHost, dbUser, dbPass, dbDatabase, userId, colId, ccId, keyId, queryId, numBits

	var resquery = request('POST', fhePyURL, {
		json: {
			operation: 	'query',
			userId: 	parseInt(req.params.userId,10),
			colId: 		parseInt(req.params.colId, 10),
			ccId:		recentCC.ccId,
			keyId: 		recentKeyPair.keyId,
			queryId: 	queryId,
			dbHost: 	'localhost',
			dbDatabase: 'fhe_test',
			dbUser: 	'root',
			dbPass: 	'',
			numBits: 	8
		},
	});
	// should be an encrypted int, 0 for no val, pos for any other val
	var queryResCtext = JSON.parse(resquery.getBody());

	if(Buffer.isBuffer(queryResCtext)){
		queryResCtext = queryResCtext.toString('utf8');
	}

	if(Buffer.isBuffer(recentCC.ccData)){
		recentCC.ccData = recentCC.ccData.toString('utf8');
	}

	if(Buffer.isBuffer(recentKeyPair.privatekey)){
		recentKeyPair.privatekey = recentKeyPair.privatekey.toString('utf8');
	}

	var queryResDecrypted = fheInterface.decrypt(recentCC.ccData, recentKeyPair.privatekey, queryResCtext);

	res.send(JSON.stringify(queryResDecrypted));

});


module.exports = router;