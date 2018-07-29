var express = require('express');
var router = express.Router();

var dbInterface = require('../db_interface_mysql.js');

/*
	collection plaintext kv pairs

		add
			params: userId, colId, key, value
			return: true/false
			/collections/:userId/add/:colId/:colName

		get all 
			params: userId
			return: [{colId, name},...] as json
			/collections/:userId/getAll

		update collection
			params: userId, colId, name
			return: true/false

		delete
			params: userId, colId
			return: true/false

*/

// add with auto increment
router.put('/:userId/add/:colName/', function(req, res){
	var ret = dbInterface.putCollection(req.colName, req.userId, null);
	if(!ret){

	}
	else{

	}
});


// get all ids and names
router.put('/:userId/getAll/', function(req, res){
	var ret = dbInterface.getAllCollectionNames(req.userId);
	if(!ret){

	}
	else{

	}
});

// update
router.put('/:userId/update/:colId/:colName/', function(req, res){
	var ret = dbInterface.putCollection(req.colName, req.userId, req.colId);
	if(!ret){

	}
	else{

	}
});

// delete
router.put('/:userId/delete/:colId/', function(req, res){
	var ret = dbInterface.deleteCollection(req.userId, req.colId);
	if(!ret){

	}
	else{

	}
});