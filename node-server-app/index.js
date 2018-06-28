#!/usr/bin/env node
var express = require('express');
var app = express();

var fhePyAddr = "http://localhost:8082";

var fs = require('fs');

app.get('/', function(req, res){
	fs.readFile('../test_react.html', function (err, html) {
		if (err) {
			throw err; 
		}
		res.write(html);
		res.end();       
	});
});

app.get('/fhe/:operation/:cryptocontext', function (req, res) {

	// res.write(req.params.operation);
	// res.end();
	// return;
	// First read existing users.
	switch(req.params.operation){
		case 'cryptocontext':
				// use default params
			var spawn = require("child_process").spawn;

			var fhePyProcess = spawn('python3',[fhePyScript, 'cryptocontext']);

			fhePyProcess.stdout.on('data', function (data){
				res.write(data);
				res.end();
			});
			fhePyProcess.stderr.on('data', (data) => {

		        res.write(data);
				res.end();
		    });

			break;
		case 'keygen':

			var cryptocontext = req.params.cryptocontext;
			var spawn = require("child_process").spawn;
			var fhePyProcess = spawn('python3',[fhePyScript, 'keygen', cryptocontext]);
			fhePyProcess.stdout.on('data', function (data){
				res.write(data);
				res.end();
			});
			fhePyProcess.stderr.on('data', (data) => {

		        res.write(data);
				res.end();
		    });
			break;
		case 'encrypt':
			
			var cryptocontext = req.query.cryptocontext;
			var publicKey = req.query.pubkey;
			var plaintext = req.query.plaintext;

			var spawn = require("child_process").spawn;
			var fhePyProcess = spawn('python3',[fhePyScript, 'encrypt', cryptocontext, publicKey, plaintext]);
			fhePyProcess.stdout.on('data', function (data){
				res.write(data);
				res.end();
			});
			break;
		case 'decrypt':
			var ciphertext = req.query.ciphertext;
			var cryptocontext = req.query.cryptocontext;
			var privateKey = req.query.privkey;
			var spawn = require("child_process").spawn;
			var fhePyProcess = spawn('python3',[fhePyScript, 'decrypt', cryptocontext, privateKey, ciphertext]);
			fhePyProcess.stdout.on('data', function (data){
				res.write(data);
				res.end();
			});
			break;
		default:
			break;
	}
});


// function cryptoContext(){
// 	return;
// }

// function keygen(cc){

// }

var server = app.listen(8081, function () {

	var host = server.address().address
	var port = server.address().port
	console.log("FHE app listening at http://%s:%s", host, port)

})