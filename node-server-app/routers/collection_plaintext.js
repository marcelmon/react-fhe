var express = require('express');
var router = express.Router();

var dbInterface = require('../db_interface_mysql.js');

/*
	collection plaintext kv pairs

		add
			params: userId, colId, key, value
			return: true/false
			/collection_plaintext/:userId/:colId/add/:key/:value/

		get all 
			params: userId
			return: [{ptext_id, key, value},...] as json
			/collection_plaintext/:userId/:colId/getAll/

		update collection plaintext
			params: userId, colId, ptextId, key, value
			return: true/false
			/collection_plaintext/:userId/:colId/update/:ptextId/:key/:value/

		delete
			params: userId, colId
			return: true/false

*/

// add with auto increment
router.put('/:userId/:colId/add/:key/:value/', function(req, res){
	var ret = dbInterface.putPlaintextKVPair(req.key, req.value, req.userId, req.colId, null);
	if(!ret){

	}
	else{

	}
});


// get all ids and keys and values
router.put('/:userId/:colId/getAll/', function(req, res){
	var ret = dbInterface.getAllPlaintextKeysValuesData(req.userId, req.colId);
	if(!ret){

	}
	else{

	}
});

// update
router.put('/:userId/:colId/update/:ptextId/:key/:value/', function(req, res){
	var ret = dbInterface.putPlaintextKVPair(req.key, req.value, req.userId, req.colId, ptextId);
	if(!ret){

	}
	else{

	}
});

// delete
router.put('/:userId/:colId/delete/:ptextId/', function(req, res){
	var ret = dbInterface.deletePlaintextKVPair(req.userId, req.colId, req.ptextId);
	if(!ret){

	}
	else{

	}
});