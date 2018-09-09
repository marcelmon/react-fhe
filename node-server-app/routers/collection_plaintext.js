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
router.post('/:userId/:colId/add/:key/:value/', function(req, res){
	var ret = dbInterface.putPlaintextKVPair(req.params.key, req.params.value, req.userId, req.params.colId, null);
	if(!ret){
		res.status(500).send('Something broke in put kv pair!');
	}
	else{
		res.setHeader('Content-Type', 'application/json');
	    res.send(JSON.stringify({ id: ret }));
	}
});


// get all ids and keys and values
router.post('/:userId/:colId/getAll/', function(req, res){
	var ret = dbInterface.getAllPlaintextKeysValuesData(req.userId, req.params.colId);
	if(!ret){
		res.status(500).send('Something broke in get all kv pairs!');
	}
	else{
		res.setHeader('Content-Type', 'application/json');
	    res.send(JSON.stringify(ret));
	}
});

// update
router.post('/:userId/:colId/update/:ptextId/:key/:value/', function(req, res){
	var ret = dbInterface.putPlaintextKVPair(req.params.key, req.params.value, req.userId, req.params.colId, req.params.ptextId);
	if(!ret){
		res.status(500).send('Something broke in update kv pair!');
	}
	else{
		res.setHeader('Content-Type', 'application/json');
	    res.send(JSON.stringify({id:ret}));
	}
});

// delete
router.post('/:userId/:colId/delete/:ptextId/', function(req, res){
	var ret = dbInterface.deletePlaintextKVPair(req.userId, req.params.colId, req.params.ptextId);
	if(!ret){
		res.status(500).send('Something broke in delete kv pair!');
	}
	else{
		res.setHeader('Content-Type', 'application/json');
	    res.send(JSON.stringify(true));
	}
});


module.exports = router;