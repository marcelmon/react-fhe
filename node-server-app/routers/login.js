var express = require('express');
var router 	= express.Router();

var fs 		= require('fs');

var dbInterface 	= require('../db_interface_mysql.js');
var bcrypt = require('bcrypt');

// var loginHtml = '<form method="post" action="/login">
// <input type="text" value="username" name="username"></input>
// <input type="text" value="password" name="password"></input>
// <input type="submit" value="login"/>
// </form>';

router.get('/', function(req, res){
	console.log("aaaaa")
	fs.readFile('../login_html.html', function (err, html) {
		if (err) {
			throw err; 
		}
		res.write('<html>'+html+'</html>');
		res.end();       
	});
});

router.post('/', function(req, res){
	var username = req.body.username;
	var password = req.body.password;

	var oppType = req.body.type;
	if(oppType == 'login'){
		var passhash = dbInterface.userLoginPassword(username);
		if(!passhash || !passhash.password_hash || !passhash.user_id || !bcrypt.compareSync(password,passhash.password_hash)){
			req.session.reset();
			fs.readFile('../login_html.html', function (err, html) {
				if (err) {
					throw err; 
				}
				res.write('<html><div>Failed login!</div>'+html+'</html>');
				res.end();       
			});
		}
		else{
			req.session.userId = passhash.user_id;
			res.redirect('/');
			res.end();
		}
	}
	else if (oppType == 'create'){
		if(dbInterface.getUser(username)){
			req.session.reset();
			fs.readFile('../login_html.html', function (err, html) {
				if (err) {
					throw err; 
				}
				res.write('<html><div>User exists!</div>'+html+'</html>');
				res.end();       
			});
		}
		else{
			var passwordHash = bcrypt.hashSync(password, 10);
			dbInterface.addUser(username, passwordHash);
			fs.readFile('../login_html.html', function (err, html) {
				if (err) {
					throw err; 
				}
				res.write('<html><div>Create success, now log in!</div>'+html+'</html>');
				res.end();       
			});
		}
	}
		
});



module.exports = router;