const request = require('sync-request');


var fs 		= require('fs');


var fhePyURL = "http://localhost:8082";

var generateCryptoContext = function(){
	var res = request('POST', fhePyURL, {
		json: {
			operation: 'cryptocontext'
		},
	});
	return res.getBody();
};

/*
	returns :
	{
		cryptocontext: ...,
		publickey: ...,
		privatekey: ...
	}
*/
var keygen = function(cryptocontext){
	var res = request('POST', fhePyURL, {
		json: {
			operation: 'keygen',
			cryptocontext: cryptocontext
		},
	});
	return JSON.parse(res.getBody());
};

var encrypt = function(cryptocontext, publickey, plaintext){
	var res = request('POST', fhePyURL, {
		json: {
			operation: 		'encrypt',
			cryptocontext: 	cryptocontext,
			publickey: 		publickey,
			plaintext: 		plaintext
		},
	});
	return res.getBody();
};

var decrypt = function(cryptocontext, privatekey, ciphertext){

	var res = request('POST', fhePyURL, {
		json: {
			operation: 		'decrypt',
			cryptocontext: 	cryptocontext,
			privatekey: 	privatekey,
			ciphertext: 	ciphertext
		},
	});
	return res.getBody();
};





var assertTrue = function(val){
	if(!val){
		console.log("The error val was:");
		console.log(val);
		throw new Error('assert true error thrown')
	}
	return;
}

var testAll = function(){

	var outfile = "./test_out.txt";
	var plaintext = "a";

	var cc = generateCryptoContext();

	fs.writeFileSync(outfile, "cc is : \n\n");
	fs.appendFileSync(outfile, cc);
	fs.appendFileSync(outfile, "\n\n\n");

	var keygenRet = keygen(cc);

	var newCC = keygenRet.cryptocontext;
	var privatekey = keygenRet.privatekey;
	var publickey = keygenRet.publickey;

	fs.appendFileSync(outfile, "newCC is : \n\n");
	fs.appendFileSync(outfile, newCC);
	fs.appendFileSync(outfile, "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n");

	fs.appendFileSync(outfile, "privatekey is : \n\n");
	fs.appendFileSync(outfile, privatekey);
	fs.appendFileSync(outfile, "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n");

	fs.appendFileSync(outfile, "publickey is : \n\n");
	fs.appendFileSync(outfile, publickey);
	fs.appendFileSync(outfile, "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n");


	var encResult = encrypt(newCC, publickey, plaintext);

	fs.appendFileSync(outfile, "encResult is : \n\n");
	fs.appendFileSync(outfile, encResult);
	fs.appendFileSync(outfile, "\n\n\n");

	var decResult = decrypt(newCC, privatekey, encResult);

	assertTrue(decResult == plaintext);
}



// most simple test is to perform a cc gen, keygen, encrypt, decrypt and check that it matches
if(process.argv.indexOf("--test") > -1){
	testAll();
	console.log("FINISHED TESTS!");
}