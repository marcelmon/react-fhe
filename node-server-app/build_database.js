var mysql = require('sync-mysql');

var fs = require('fs');


var mysqlConnect1 = function(){

	return new mysql({
		host: 'localhost',
		user: 'root',
		password: '',
		// database: 'sp_test'
	});

};

var mysqlConnect2 = function(){

	return new mysql({
		host: 'localhost',
		user: 'root',
		password: '',
		database: 'fhe_test'
	});

};

var mysqlConnectQuery1 = function(query){

	var conn = mysqlConnect1();
	return conn.query(query);
	
};

var mysqlConnectQuery2 = function(query){

	var conn = mysqlConnect2();
	return conn.query(query);
	
}

var dbfile = "user_data_database.sql";

var resDrop = mysqlConnectQuery1("drop database if exists fhe_test;");
console.log("res drop :");
console.log(resDrop);

var resCreate = mysqlConnectQuery1("create database fhe_test;");

var querybuild = fs.readFileSync(dbfile, 'utf8');

var resBuild = mysqlConnectQuery2(querybuild); 
console.log("res build:")
console.log(resBuild)