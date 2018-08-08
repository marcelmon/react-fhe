var express = require('express');
var router = express.Router();


var dbInterface 	= require('../db_interface_mysql.js');

// get encrypted ids
router.post('/:userId/:colId/getEncryptedIds/', function(req, res){


	var ccIds = dbInterface.getAllCryptoContextIds(req.params.userId);
	if(!ccIds || ccIds.length == 0){
		res.status(500).send('Err cc!');
		return;
	}
	var recentCCId = ccIds[ccIds.length - 1];

	var keypairIds = dbInterface.getAllKeypairIds(req.params.userId, recentCCId);
	if(!keypairIds || keypairIds.length == 0){
		res.status(500).send('Err kp!');
		return;
	}
	var recentKeyPairId = keypairIds[keypairIds.length - 1];

	var allKeyValueCtextIds = dbInterface.getCiphertextValueAndBitIdsForCollection(req.params.userId, req.params.colId, recentCCId, recentKeyPairId);
	if(!allKeyValueCtextIds){
		res.status(500).send('Something broke in getEncryptedIds');
	}
	else{
		res.setHeader('Content-Type', 'application/json');
	    res.send(JSON.stringify(allKeyValueCtextIds));
	}
});

module.exports = router;