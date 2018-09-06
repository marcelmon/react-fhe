var mysql = require('sync-mysql');


var fs 			= require('fs');
var filepath 	= require('path');

var config = JSON.parse(fs.readFileSync(__dirname+'/../config.json', 'utf8'));


var mysqlConnect = function(){

	return new mysql({
		host: config.dbhost,
		user: config.dbuser,
		password: config.dbpassword,
		database: config.dbdatabase
	});

};

var mysqlConnectQuery = function(query){

	var conn = mysqlConnect();
	return conn.query(query);
	
}



// user_cryptocontext
// __________________

var testInsert = function(dataString, newId = null){

	var res;
	if(newId == null){
		res = mysqlConnectQuery('call testNewTableRet("'+dataString+'", null);'); 
	} 
	else{
		res = mysqlConnectQuery('call testNewTableRet("'+dataString+'",' + newId + ');');
	}
	var retArray = [];
	res[0].forEach(function(value){
		retArray.push(value.newId);
	});
	return retArray;
};


var testGetIds = function(){
	var res = mysqlConnectQuery('call testNewTableRetGetIds();'); 

	// console.log("in testGetIds");
	// console.log(res);
	// console.log("res above\n");
	// console.log(res[0]);
	// console.log("res[0] above \n\n\n");
	// console.log(res[0][0]);
	// console.log("res[0][0] above \n\n\n");
	// console.log(res[0][0].id);
	// console.log("res[0][0].id above \n\n\n");
	// console.log("DONE DONE DONE \n\n\n");
	var retArray = [];
	res[0].forEach(function(value){
		retArray.push(value.id);
	});
	return retArray;
};


console.log("testGetIds : ");
console.log(testGetIds());

console.log("testInsert : ");
console.log(testInsert("hey"));

console.log("testGetIds : ");
console.log(testGetIds());

console.log("testInsert : ");
console.log(testInsert("hey2", "2"));
console.log("testGetIds : ");
console.log(testGetIds());

console.log("testInsert : ");
console.log(testInsert("hey2.1", "2"));
console.log("testGetIds : ");
console.log(testGetIds());
console.log("testInsert : ");
console.log(testInsert("hey3", "3"));
console.log("testGetIds : ");
console.log(testGetIds());