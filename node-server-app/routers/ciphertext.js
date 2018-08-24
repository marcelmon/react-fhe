var express = require('express');
var router = express.Router();


var dbInterface 	= require('../db_interface_mysql.js');


var getRecentCCAndKeyPairId = function(userId){
	var ccIds = dbInterface.getAllCryptoContextIds(userId);
	if(!ccIds || ccIds.length == 0){
		return false;
	}
	var recentCCId = ccIds[ccIds.length - 1];

	var keypairIds = dbInterface.getAllKeypairIds(userId, recentCCId);
	if(!keypairIds || keypairIds.length == 0){
		return false;
	}
	var recentKeyPairId = keypairIds[keypairIds.length - 1];
	return {ccId : recentCCId, keypairId: recentKeyPairId};
};

// get encrypted ids
router.post('/:userId/:colId/getEncryptedIds/', function(req, res){

	var recentIds = getRecentCCAndKeyPairId(req.params.userId);
	if(!recentIds){
		res.setHeader('Content-Type', 'application/json');
	    res.send(JSON.stringify(null));
	    return;
	}
	var allKeyValueCtextIds = dbInterface.getCiphertextValueAndBitIdsForCollection(req.params.userId, req.params.colId, recentIds.ccId, recentIds.keypairId);
	if(!allKeyValueCtextIds){
		res.status(500).send('Something broke in getEncryptedIds');
	}
	else{
		res.setHeader('Content-Type', 'application/json');
	    res.send(JSON.stringify(allKeyValueCtextIds));
	}
});


router.post('/:userId/:colId/getCiphertextKeyBitSample/:kvId/:bitId/', function(req, res){
	var recentIds 		= getRecentCCAndKeyPairId(req.params.userId);
	var keyBitSample 	= dbInterface.getCiphertextKeyBitSample(req.params.userId, req.params.colId, recentIds.ccId, recentIds.keypairId, req.params.kvId, req.params.bitId);
	if(!keyBitSample){
		res.status(500).send('Something broke in getCiphertextKeyBitSample');
	}
	else{
		if(Buffer.isBuffer(keyBitSample)){
			valueSample = keyBitSample.toString('utf8');
		}
		keyBitSample = JSON.parse(keyBitSample);
		console.log("the buffer getCiphertextKeyBitSample!");
		console.log(keyBitSample);
		res.setHeader('Content-Type', 'application/json');
	    res.send(JSON.stringify(keyBitSample));
	}
});

router.post('/:userId/:colId/getCiphertextValueSample/:kvId/', function(req, res){
	var recentIds 		= getRecentCCAndKeyPairId(req.params.userId);
	var valueSample 	= dbInterface.getCiphertextValueSample(req.params.userId, req.params.colId, recentIds.ccId, recentIds.keypairId, req.params.kvId);
	if(!valueSample){
		res.status(500).send('Something broke in getCiphertextValueSample');
	}
	else{
		if(Buffer.isBuffer(valueSample)){
			valueSample = valueSample.toString('utf8');
		}
		valueSample = JSON.parse(valueSample);
		console.log("the buffer getCiphertextValueSample!");
		console.log(valueSample);
		
		
		res.setHeader('Content-Type', 'application/json');
	    res.send(JSON.stringify(valueSample))
	}
});

module.exports = router;