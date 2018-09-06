const request 		= require('sync-request');
const dbInterface 	= require('../db_interface_mysql.js');

var fs 		= require('fs');
var config = JSON.parse(fs.readFileSync(__dirname+'/../../config.json', 'utf8'));
var nodeServerUrl = config.appurl;

var assertTrue = function(val){
	if(!val){
		console.log("The error val was:");
		console.log(val);
		throw new Error('assert true error thrown')
	}
	return;
}

var testUserId = 1;

// want to delete everything for this user first

var deleteAllUserData = function(userId){
	var deleteCCs = "DELETE FROM user_cryptocontexts where user_id = "+userId+";";
	dbInterface.mysqlConnectQuery(deleteCCs);

	var deleteKeys = "DELETE FROM user_cryptocontext_public_private_keypairs where user_id = "+userId+";";
	dbInterface.mysqlConnectQuery(deleteKeys);

	var deleteCollections = "DELETE FROM user_collections where user_id = "+userId+";";
	dbInterface.mysqlConnectQuery(deleteCollections);

	var deletePlaintext = "DELETE FROM user_collections_plaintext_key_values where user_id = "+userId+";";
	dbInterface.mysqlConnectQuery(deletePlaintext);

	var deleteCtextKeyBits = "DELETE FROM user_ciphertext_keys_bitwise where user_id = "+userId+";";
	dbInterface.mysqlConnectQuery(deleteCtextKeyBits);

	var deleteCtextValues = "DELETE FROM user_ciphertext_values where user_id = "+userId+";";
	dbInterface.mysqlConnectQuery(deleteCtextValues);
}


var checkUserDataEmpty = function(userId){
	var ccIds = dbInterface.getAllCryptoContextIds(testUserId);
	assertTrue(ccIds.length == 0);
	console.log("OIII");
}







var testCollections = function(){
	var collectionsUrl = nodeServerUrl+'/collections/'+testUserId+'/';

	// test empty getAll
	var emptyGetAll = request('POST', collectionsUrl+'getAll/');
	assertTrue(JSON.parse(emptyGetAll.getBody()).length == 0);

	
	var colName_1 = "col_1";
	var colName_2 = "col_2";

	var col_1_id;
	var col_2_id;

	// test put (auto increment return > 0)
	var putCol1 = request('POST', collectionsUrl+'add/'+colName_1+'/');
	col_1_id = JSON.parse(putCol1.getBody()).id;
	assertTrue(col_1_id > 0);

	// test put again
	var putCol2 = request('POST', collectionsUrl+'add/'+colName_2+'/');
	col_2_id = JSON.parse(putCol2.getBody()).id;
	assertTrue(col_2_id > 0);

	
	// test get all
	var getAll = request('POST', collectionsUrl+'getAll/');
	var allColNamesAndIds = JSON.parse(getAll.getBody());
	assertTrue(allColNamesAndIds.length == 2);

	if(allColNamesAndIds[0].id == col_1_id){
		assertTrue(allColNamesAndIds[0].name 	== colName_1);

		assertTrue(allColNamesAndIds[1].id 		== col_2_id);
		assertTrue(allColNamesAndIds[1].name 	== colName_2);
	}
	else if(allColNamesAndIds[0].id == col_2_id){
		assertTrue(allColNamesAndIds[0].name 	== colName_2);

		assertTrue(allColNamesAndIds[1].id 		== col_1_id);
		assertTrue(allColNamesAndIds[1].name 	== colName_1);
	}
	else{
		assertTrue(false);
	}
	


	// test update first
	var colName_1_update = "col_1_1";

	var updateCol1 = request('POST', collectionsUrl+'update/'+col_1_id+'/'+colName_1_update+'/');
	col_1_id_update = JSON.parse(updateCol1.getBody()).id;
	assertTrue(col_1_id_update == col_1_id);


	// test get all after update name
	getAll = request('POST', collectionsUrl+'getAll/');
	allColNamesAndIds = JSON.parse(getAll.getBody());
	assertTrue(allColNamesAndIds.length == 2);

	if(allColNamesAndIds[0].id == col_1_id){
		assertTrue(allColNamesAndIds[0].name 	== colName_1_update);

		assertTrue(allColNamesAndIds[1].id 		== col_2_id);
		assertTrue(allColNamesAndIds[1].name 	== colName_2);
	}
	else if(allColNamesAndIds[0].id == col_2_id){
		assertTrue(allColNamesAndIds[0].name 	== colName_2);

		assertTrue(allColNamesAndIds[1].id 		== col_1_id);
		assertTrue(allColNamesAndIds[1].name 	== colName_1_update);
	}
	else{
		assertTrue(false);
	}


	// test delete first
	var deleteCol2 = request('POST', collectionsUrl+'delete/'+col_1_id+'/');
	assertTrue(JSON.parse(deleteCol2.getBody()) == true);

	// test get all (only second should be)

	// test get all after update name
	getAll = request('POST', collectionsUrl+'getAll/');
	allColNamesAndIds = JSON.parse(getAll.getBody());
	assertTrue(allColNamesAndIds.length == 1);
	assertTrue(allColNamesAndIds[0].id == col_2_id);
	assertTrue(allColNamesAndIds[0].name 	== colName_2);

}


var testCollectionPlaintext = function(){

	var colId_1 = 1;

	var plaintextUrl = nodeServerUrl+'/collection_plaintext/'+testUserId+'/'+colId_1+'/';

	var key_1 	= "key_1";
	var value_1 = "value_1";

	var key_2 	= "key_2";
	var value_2 = "value_2";

	var key_1_update 	= "key_1_1";
	var value_1_update 	= "key_1_1";

	var kvPairId_1;
	var kvPairId_2;



	// test get all empty
	var emptyGetAll = request('POST', plaintextUrl+'getAll/');
	assertTrue(JSON.parse(emptyGetAll.getBody()).length == 0);

	// test add kv pair - reutnr auto increment > 1
	var putKV1 = request('POST', plaintextUrl+'add/'+key_1+'/'+value_1+'/');
	kvPairId_1 = JSON.parse(putKV1.getBody()).id;
	assertTrue(kvPairId_1 > 0);

	// test add again
	var putKV2 = request('POST', plaintextUrl+'add/'+key_2+'/'+value_2+'/');
	kvPairId_2 = JSON.parse(putKV2.getBody()).id;
	assertTrue(kvPairId_2 > 0);

	assertTrue(kvPairId_2 != kvPairId_1);


	// test get all again
	var getAll = request('POST', plaintextUrl+'getAll/');
	var allKVAndIds = JSON.parse(getAll.getBody());
	assertTrue(allKVAndIds.length == 2);

	if(allKVAndIds[0].id == kvPairId_1){
		assertTrue(allKVAndIds[0].key 	== key_1);
		assertTrue(allKVAndIds[0].value == value_1);

		assertTrue(allKVAndIds[1].id 	== kvPairId_2);
		assertTrue(allKVAndIds[1].key 	== key_2);
		assertTrue(allKVAndIds[1].value == value_2);
	}
	else if(allKVAndIds[0].id == kvPairId_2){
		assertTrue(allKVAndIds[0].key 	== key_2);
		assertTrue(allKVAndIds[0].value == value_2);

		assertTrue(allKVAndIds[1].id 	== kvPairId_1);
		assertTrue(allKVAndIds[1].key 	== key_1);
		assertTrue(allKVAndIds[1].value == value_1);
	}
	else{
		assertTrue(false);
	}


	// test update first
	var kv_1_id_update;
	var updateKV1 = request('POST', plaintextUrl+'update/'+kvPairId_1+'/'+key_1_update+'/'+value_1_update+'/');
	kv_1_id_update = JSON.parse(updateKV1.getBody()).id;
	assertTrue(kv_1_id_update == kvPairId_1);

	
	// test get all again
	getAll = request('POST', plaintextUrl+'getAll/');
	allKVAndIds = JSON.parse(getAll.getBody());
	assertTrue(allKVAndIds.length == 2);

	if(allKVAndIds[0].id == kvPairId_1){
		assertTrue(allKVAndIds[0].key 	== key_1_update);
		assertTrue(allKVAndIds[0].value == value_1_update);

		assertTrue(allKVAndIds[1].id 	== kvPairId_2);
		assertTrue(allKVAndIds[1].key 	== key_2);
		assertTrue(allKVAndIds[1].value == value_2);
	}
	else if(allKVAndIds[0].id == kvPairId_2){
		assertTrue(allKVAndIds[0].key 	== key_2);
		assertTrue(allKVAndIds[0].value == value_2);

		assertTrue(allKVAndIds[1].id 	== kvPairId_1);
		assertTrue(allKVAndIds[1].key 	== key_1_update);
		assertTrue(allKVAndIds[1].value == value_1_update);
	}
	else{
		assertTrue(false);
	}


	// test delete first
	var deleteKV2 = request('POST', plaintextUrl+'delete/'+kvPairId_1+'/');
	assertTrue(JSON.parse(deleteKV2.getBody()) == true);

	// test get all again
	getAll = request('POST', plaintextUrl+'getAll/');
	allKVAndIds = JSON.parse(getAll.getBody());
	assertTrue(allKVAndIds.length == 1);
	assertTrue(allKVAndIds[0].id 	== kvPairId_2);
	assertTrue(allKVAndIds[0].key 	== key_2);
	assertTrue(allKVAndIds[0].value == value_2);


}


var testEncryptAll = function(){
	var colId_encrypt_3 = 3;


	// want only 8 bits for keys
	var key_1 = "1";
	var key_2 = "2";

	var value_1 = "3";
	var value_2 = "4";

	var kvPairId_1;
	var kvPairId_2;

	var plaintextUrl = nodeServerUrl+'/collection_plaintext/'+testUserId+'/'+colId_encrypt_3+'/';


	// put some values
	var putKV1 = request('POST', plaintextUrl+'add/'+key_1+'/'+value_1+'/');
	kvPairId_1 = JSON.parse(putKV1.getBody()).id;
	var putKV2 = request('POST', plaintextUrl+'add/'+key_2+'/'+value_2+'/');
	kvPairId_2 = JSON.parse(putKV2.getBody()).id;

	// check values are in
	var getAll = request('POST', plaintextUrl+'getAll/');
	var allKVAndIds = JSON.parse(getAll.getBody());
	assertTrue(allKVAndIds.length == 2);

	if(allKVAndIds[0].id == kvPairId_1){
		assertTrue(allKVAndIds[0].key 	== key_1);
		assertTrue(allKVAndIds[0].value == value_1);

		assertTrue(allKVAndIds[1].id 	== kvPairId_2);
		assertTrue(allKVAndIds[1].key 	== key_2);
		assertTrue(allKVAndIds[1].value == value_2);
	}
	else if(allKVAndIds[0].id == kvPairId_2){
		assertTrue(allKVAndIds[0].key 	== key_2);
		assertTrue(allKVAndIds[0].value == value_2);

		assertTrue(allKVAndIds[1].id 	== kvPairId_1);
		assertTrue(allKVAndIds[1].key 	== key_1);
		assertTrue(allKVAndIds[1].value == value_1);
	}
	else{
		assertTrue(false);
	}

	var encryptAllUrl = nodeServerUrl+'/encrypt_collection/'+testUserId+'/';


	var encryptAllRet = request('POST', encryptAllUrl+colId_encrypt_3+'/encrypt_all/');
	console.log(encryptAllRet);

}



var testGetAllEncryptedIdsAndSamples = function(){


	var ccId = 4;
	var keyId = 4;
	var colId_encrypt_3 = 4;


	// want only 8 bits for keys
	var key_1 = "8";
	var key_2 = "9";

	var value_1 = "a";
	var value_2 = "b";

	var kvPairId_1;
	var kvPairId_2;

	var plaintextUrl = nodeServerUrl+'/collection_plaintext/'+testUserId+'/'+colId_encrypt_3+'/';

	// console.log("put 1");
	// put some values
	var putKV1 = request('POST', plaintextUrl+'add/'+key_1+'/'+value_1+'/');
	kvPairId_1 = JSON.parse(putKV1.getBody()).id;
	var putKV2 = request('POST', plaintextUrl+'add/'+key_2+'/'+value_2+'/');
	kvPairId_2 = JSON.parse(putKV2.getBody()).id;

	var encryptAllUrl = nodeServerUrl+'/encrypt_collection/'+testUserId+'/';
	var encryptAllRet = request('POST', encryptAllUrl+colId_encrypt_3+'/encrypt_all/');

	var getAllCtextIdsUrl = nodeServerUrl+'/ciphertext/'+testUserId+'/';

	console.log("the before url : ");
	console.log(getAllCtextIdsUrl+colId_encrypt_3+'/getEncryptedIds/');

	var ctextIdsRet = request('POST', getAllCtextIdsUrl+colId_encrypt_3+'/getEncryptedIds/');

	console.log("a thing");
	console.log(ctextIdsRet);
	var ctextIdsRetArray = JSON.parse(ctextIdsRet.getBody());

	assertTrue(ctextIdsRetArray[0].kvPairId == kvPairId_1);
	assertTrue(ctextIdsRetArray[0].bitIds.length > 0);
	assertTrue(ctextIdsRetArray[0].valueId == kvPairId_1);

	assertTrue(ctextIdsRetArray[1].kvPairId == kvPairId_2);
	assertTrue(ctextIdsRetArray[1].bitIds.length > 0);
	assertTrue(ctextIdsRetArray[1].valueId == kvPairId_2);


	var bitIdOne = ctextIdsRetArray[0].bitIds.length -1;
	var keyBitSampleOne = request('POST', getAllCtextIdsUrl+colId_encrypt_3+'/getCiphertextKeyBitSample/'+kvPairId_1+'/'+bitIdOne+'/');
	console.log("max bit sample 1:");
	console.log(JSON.parse(keyBitSampleOne.getBody()));


	var valueSampleOne = request('POST', getAllCtextIdsUrl+colId_encrypt_3+'/getCiphertextValueSample/'+kvPairId_1+'/');
	console.log("value sample 1:");
	console.log(JSON.parse(valueSampleOne.getBody()));
	
};


console.log("start delete");
deleteAllUserData(testUserId);
console.log("done delete");
checkUserDataEmpty(testUserId);

// test collections router
console.log("the url:  " +  nodeServerUrl+'/collections/'+testUserId+'/getAll/');
var res = request('POST', nodeServerUrl+'/collections/'+testUserId+'/getAll/');
console.log(JSON.parse(res.getBody()));
console.log("the res!");

console.log("test collections");

testCollections();

console.log("test collection plaintext");
testCollectionPlaintext();

console.log("test encrypt all");


console.log("start testEncryptAll");

testEncryptAll();


console.log("start delete");
deleteAllUserData(testUserId);
console.log("done delete");
checkUserDataEmpty(testUserId);


console.log('testGetAllEncryptedIdsAndSamples');

testGetAllEncryptedIdsAndSamples();

console.log("test complete HUZZAH!");