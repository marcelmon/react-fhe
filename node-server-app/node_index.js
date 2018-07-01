#!/usr/bin/env node
var express = require('express');
var app = express();

var fhePyAddr = "http://localhost:8082";

var fs = require('fs');

var bodyParser = require('body-parser');


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false , limit: '100mb'}))

// parse application/json
app.use(bodyParser.json({limit: '100mb'}))

app.get('/', function(req, res){
	fs.readFile('../test_react.html', function (err, html) {
		if (err) {
			throw err; 
		}
		res.write(html);
		res.end();       
	});
});

app.post('/fhe/:operation', function (req, res) {
    const request = require('request');

	switch(req.params.operation){
		case 'cryptocontext':

			request.post({
				// headers: {'content-type' : 'application/json'},
				url:     fhePyAddr,
				// json : true,
				body: "operation=cryptocontext"
			}, function(error, response, body){
				res.write(body);
				res.end();
			});
			break;

		case 'keygen':

			var cryptocontext = req.body.cryptocontext;

			request.post({
				// headers: {'content-type' : 'application/x-www-form-urlencoded'},
				url:     fhePyAddr,
				// json : true,
				body: 'operation=keygen&cryptocontext='+cryptocontext
			}, function(error, response, body){
				// console.log(body);
				res.write(body);
				res.end();
			});
			break;

		case 'encrypt':
			
			var cryptocontext 	= req.body.cryptocontext;
			var publickey 		= req.body.publickey;
			var plaintext 		= req.body.plaintext;
			console.log("in encrypt");
			request.post({
				// headers: {'content-type' : 'application/x-www-form-urlencoded'},
				url:     fhePyAddr,
				// json : true,
				body: 'operation=encrypt&cryptocontext='+cryptocontext+'&publickey='+publickey+'&plaintext='+plaintext
			}, function(error, response, body){
				// console.log(body);
				res.write(body);
				res.end();
			});
			break;

		case 'decrypt':

			var cryptocontext 	= req.body.cryptocontext;
			var privatekey 		= req.body.privatekey;
			var ciphertext 		= req.body.ciphertext;
			console.log("in decrypt");
			request.post({
				// headers: {'content-type' : 'application/x-www-form-urlencoded'},
				url:     fhePyAddr,
				// json : true,
				body: 'operation=decrypt&cryptocontext='+cryptocontext+'&privatekey='+privatekey+'&ciphertext='+ciphertext
					
			}, function(error, response, body){
				// console.log(body);
				res.write(body);
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