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
router.post('/:userId/add/:colName/', function(req, res){
	var ret = dbInterface.putCollection(req.params.colName, req.userId, null);
	if(!ret){
		res.status(500).send('Something broke in add collection!');
	}
	else{
		res.setHeader('Content-Type', 'application/json');
	    res.send(JSON.stringify({ id: ret }));
	}
});


// get all ids and names
router.post('/:userId/getAll/', function(req, res){
	// console.log("the req ");
	// console.log(req);
	var ret = dbInterface.getAllCollectionNames(req.userId);
	if(!ret){
		res.status(500).send('Something broke in get all collections!');
	}
	else{
		res.setHeader('Content-Type', 'application/json');
	    res.send(JSON.stringify(ret));
	}
});

// update
router.post('/:userId/update/:colId/:colName/', function(req, res){
	var ret = dbInterface.putCollection(req.params.colName, req.userId, req.params.colId);
	if(!ret){
		res.status(500).send('Something broke in update collection!');
	}
	else{
		res.setHeader('Content-Type', 'application/json');
	    res.send(JSON.stringify({id:ret}));
	}
});

// delete
router.post('/:userId/delete/:colId/', function(req, res){
	var ret = dbInterface.deleteCollection(req.userId, req.params.colId);
	if(!ret){
		res.status(500).send('Something broke in delete collection!');
	}
	else{
		res.setHeader('Content-Type', 'application/json');
	    res.send(JSON.stringify(true));
	}
});



module.exports = router;