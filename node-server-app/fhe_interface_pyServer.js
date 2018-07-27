const request = require('sync-request');

var fhePyAddr = "http://localhost:8082";

/*
	NEED TO PARSE JSON RETURN FOR PARTICULAR FIELDS

*/
var generateCryptoContext = function(){
	var res request('POST', fhePyURL, {
		body: "operation=cryptocontext"
	});
	return res.getBody();
};

var keygen = function(cryptocontext){
	var res = request('POST', fhePyURL, { 
		body: "operation=keygen&cryptocontext="+cryptocontext 
	});
	return res.getBody();
};

var encrypt = function(cryptocontext, publickey, plaintext){
	var res = request('POST', fhePyURL, {
		body: 'operation=encrypt&cryptocontext='+cryptocontext+'&publickey='+publickey+'&plaintext='+plaintext 
	});
	return res.getBody();
};

var decrypt = function(cryptocontext, privatekey, ciphertext){

	var res = request('POST', fhePyURL, {
		body: 'operation=decrypt&cryptocontext='+cryptocontext+'&privatekey='+privatekey+'&ciphertext='+ciphertext
	});
	return res.getBody();
};


// most simple test is to 