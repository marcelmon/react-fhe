#!/usr/bin/env node

/*

in picking a database model:
	
	cryptocontexts: 

		{userId}_{cryptocontextId}

		generated using particular parameters
		are always unique
		store medium sized files (~KBs to ~MBs)


	keypairs: 

		{userId}_{cryptocontextId}_{keypairId}_[pubkey|privkey]

		generated from a cryptocontext
		store a public and private keypair
			can also be storing eval mult keys (which are stored inside a cryptocontext), proxy re-encrypt keys, etc..
			these extra keys are related to original cc->keypair they are generated from
		store medium sized files (~MBs)

	 	key pairs are relational sets (ccId->keypairId->['pubkey'|'privkey'])
		need to be accessed internally and externally


	plaintext collections:
		
		{userId}_{collectionId}_{plaintextId}

		group of plaintext, each with a {plaintextId} distinct within the collection
		collections can change over time (add or delete or update plaintext)
		an entire collection can be encrypted at same time and thus a snapshot is taken
			future updates after snapshot distinguish new collections from that which is encrypted

		each plaintext is small (B to ~KBs)

		plaintext collection can be any amount of plaintexts 
			total size: (~KBs to ~GBs, although GBs are very large and not likely)


	ciphertext collections:    -> using casandra we can group all bits into a super column
		
		{user_id}_{collectionId}_{cryptocontextId}_{keypairId}_{plaintextId}_bitwise_{bitid}_{ciphertextId}
		{user_id}_{collectionId}_{cryptocontextId}_{keypairId}_{plaintextId}_string_{ciphertextId}

		encryption of particular plaintext from a collection using a (cryptocontext->keypair)
		can be encrypted bitwise or as string

		bitwise encryption may be used as a key for encrypted string
			therefore a relation exists : bitwise_ -> string_{ciphertextId}
			can be created in another table

		each ciphertext is large (~MB-100MBs) (either single bit or individual unit [byte or word] in a string)

		each ciphertext collection can be any amount of ciphertexts (~MBs to ~TBs)


current opps needed for front
	- collection
		- new
		- add plaintext
		- delete plaintext
		- delete

		- encrypt collection
			- need to gen cc, keygen, encrypt

	- keygen/encrypt collection
	- encrypt collection

// cryptocontexts

	{userId}_{cryptocontextId}

	/userdata/{userId}/cryptocontexts
	/userdata/{userId}/cryptocontexts/new							/?params={}
	/userdata/{userId}/cryptocontexts/get_ids
	/userdata/{userId}/cryptocontexts/get 		/{cryptocontextId}
	/userdata/{userId}/cryptocontexts/delete 	/{cryptocontextId}

// cryptocontext keypairs
	
	{userId}_{cryptocontextId}_{keypairId}_[public|private|evalmult|reencrypt]
	
	/userdata/{userId}/cryptocontexts/{cryptocontextId}/keypairs	/
	/userdata/{userId}/cryptocontexts/{cryptocontextId}/keypairs	/new									/?type=[both|evalmult|reencrypt|...]
	/userdata/{userId}/cryptocontexts/{cryptocontextId}/keypairs	/get_ids
	/userdata/{userId}/cryptocontexts/{cryptocontextId}/keypairs	/get 		/
	/userdata/{userId}/cryptocontexts/{cryptocontextId}/keypairs	/get 		/publickey	/{keypairId}
	/userdata/{userId}/cryptocontexts/{cryptocontextId}/keypairs	/get 		/privatekey	/{keypairId}
	/userdata/{userId}/cryptocontexts/{cryptocontextId}/keypairs	/delete		/{keypairId}

// collections
	
	{userId}_{collectionId}

	/userdata/{userId}/collections 		/		
	/userdata/{userId}/collections 		/new 						/?info={name:""}
	/userdata/{userId}/collections 		/update 	/{collectionId}	/?info={name:""}
	/userdata/{userId}/collections 		/get_ids
	/userdata/{userId}/collections 		/delete 	/{collectionId}	

// plaintext collections
	
	{userId}_{collectionId}_plaintext_{plaintextId}

	/userdata/{userId}/collections 		/{collectionId}		/plaintext
	/userdata/{userId}/collections  	/{collectionId}		/plaintext 	/new 		?data=""
	/userdata/{userId}/collections 		/{collectionId}		/plaintext 	/get_ids
	/userdata/{userId}/collections 		/{collectionId}		/plaintext 	/get 		/{plaintextId} 
	/userdata/{userId}/collections 		/{collectionId}		/plaintext	/delete		/{plaintextId} 

// ciphertext collections

	{ciphertextId} here refers to the event of encrypting the particular plaintext using {collectionId}_{ccId}_{keypairId}

	{user_id}_{collectionId}_ciphertext_{ccId}_{keypairId}_{plaintextId}_bitwise_{bitid}_{ciphertextId}
	{user_id}_{collectionId}_ciphertext_{ccId}_{keypairId}_{plaintextId}_string_{ciphertextId}

	
	/userdata/{userId}/collections  	/{collectionId} 	/ciphertext /{ccId}/{keypairId} /encrypt_all_bitwise/{plaintextId}
	/userdata/{userId}/collections  	/{collectionId} 	/ciphertext /{ccId}/{keypairId}	/bitwise 			/{plaintextId}	/get_all_bit_ids


	/userdata/{userId}/collections  	/{collectionId} 	/ciphertext /{ccId}/{keypairId} /{plaintextId}  	/encrypt_one_bitwise
	/userdata/{userId}/collections  	/{collectionId} 	/ciphertext /{ccId}/{keypairId}	/{plaintextId}		/bitwise 			/{plaintextId}	/get_bit_ids	
	/userdata/{userId}/collections  	/{collectionId} 	/ciphertext /{ccId}/{keypairId}	/{plaintextId}		/bitwise 			/get_all_ids	/{plaintextId}
	/userdata/{userId}/collections  	/{collectionId} 	/ciphertext /{ccId}/{keypairId}	/{plaintextId} 		/bitwise 			/get			/{plaintextId} 	

	/userdata/{userId}/collections  	/{collectionId} 	/ciphertext /{ccId}/{keypairId}	/string 	/encrypt_one	/{plaintextId}


	/userdata/{userId}/collections  	/{collectionId} 	/ciphertext /{ccId}/{keypairId}	/encrypt_one	/{plaintextId} 	// should not be used
	/userdata/{userId}/collections  	/{collectionId} 	/ciphertext /{ccId}/{keypairId}	/encrypt_all					// used to encrypt entire collection at once and produce random ids 
	/userdata/{userId}/collections  	/{collectionId} 	/ciphertext /{ccId}/{keypairId} /get_newest_ids 				// returns the max id for each {plaintextId}_{ccId}_{keypairId}
	/userdata/{userId}/collections  	/{collectionId} 	/ciphertext /{ccId}/{keypairId} /get_newest 	/{plaintextId}
	/userdata/{userId}/collections  	/{collectionId} 	/ciphertext /{ccId}/{keypairId} /get 			/{ciphertextCollectionId} /single /{ciphertextId} 
	/userdata/{userId}/collections  	/{collectionId} 	/ciphertext /{ccId}/{keypairId} /delete 		/{ciphertextCollectionId} 
	/userdata/{userId}/collections  	/{collectionId} 	/ciphertext /{ccId}/{keypairId} /delete 		/{ciphertextCollectionId} /single /{ciphertextId} 










// below should be deleted in comments

		// cryptocontexts and keypairs
			/userdata/{userId}/cryptocontext 	/
			/userdata/{userId}/cryptocontext 	/new 				/?params={}
			/userdata/{userId}/cryptocontext 	/get_ids
			/userdata/{userId}/cryptocontext 	/get 				/{cryptocontextId}	
			/userdata/{userId}/cryptocontext 	/delete 			/{cryptocontextId}
			/userdata/{userId}/cryptocontext 	/{cryptocontextId}	/keypairs  			/new			/?evalmult=bool
			/userdata/{userId}/cryptocontext 	/{cryptocontextId}	/keypairs 			/get_ids
			/userdata/{userId}/cryptocontext 	/{cryptocontextId}	/keypairs 			/getpublickey 	/{keypairId} 	
			/userdata/{userId}/cryptocontext 	/{cryptocontextId}	/keypairs 			/getprivatekey	/{keypairId} 	

		// ciphertext 
			// ENCRYPT ENTIRE COLLECTION AT A TIME USING KNOWN KEY, SAVE THIS DATA IN RETURN, can encrypt the return values and use FHE to determine return
				// a ciphertext id is a unique id linking all the components to encrypt (ccid, pubkeyid, plaintextid), performed on collections
				/userdata/{userId}/collections/ciphertext/
					/userdata/{userId}/collections/{collectionId}/ciphertext/{cryptocontextId}/{keypairId}/{plaintextId}/new/ 	// return a ctext collection id
					/userdata/{userId}/collections/{collectionId}/ciphertext/{cryptocontextId}/{keypairId}/get_ids/  			// return  get_ctext_collection_ids
					/userdata/{userId}/collections/{collectionId}/ciphertext/{cryptocontextId}/{keypairId}/{plaintextId}/get/{ciphertextId}/
					/userdata/{userId}/collections/{collectionId}/ciphertext/{cryptocontextId}/{keypairId}/{plaintextId}/delete/{ciphertextId}/
				

					{ciphertextId} can be {collectionId}_{cryptocontextId}_{keypairId}_{plaintextId}
					or
					can radomize the id to relate to a plaintext_id in a different database	
*/

var express = require('express');
var app = express();

var fs 		= require('fs');
var config = JSON.parse(fs.readFileSync(__dirname+'/../config.json', 'utf8'));
var fhePyAddr = config.fheurl;


var bodyParser = require('body-parser');

var collectionsRouter 			= require('./routers/collections.js');
var collectionPlaintextRouter 	= require('./routers/collection_plaintext.js');
var encryptRouter 				= require('./routers/encrypt_collection.js');
var ciphertextRouter 			= require('./routers/ciphertext.js');
var encryptedQueryRouter 		= require('./routers/encrypted_query.js');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false , limit: '100mb'}))

// parse application/json
app.use(bodyParser.json({limit: '100mb'}))

app.get('/', function(req, res){
	fs.readFile('../react_html.html', function (err, html) {
		if (err) {
			throw err; 
		}
		res.write(html);
		res.end();       
	});
});

app.use('/collections', 			collectionsRouter);
app.use('/collection_plaintext', 	collectionPlaintextRouter);
app.use('/encrypt_collection', 		encryptRouter);
app.use('/ciphertext', 				ciphertextRouter);
app.use('/encrypted_query', 		encryptedQueryRouter);


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