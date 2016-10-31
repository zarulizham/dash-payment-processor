var dbPool        = require('./Database').connect();
var Logger        = require('log');
var AppConfig     = require('../config/AppConfig');

var log = new Logger(AppConfig.logLevel)


var createUser = function(username, api_key, connection, callback){
	log.debug('Creating user ' + username + ' with api_key: ' + api_key);
	connection.query("insert into user set username = ?, api_key = ?, created_date = NOW()", [username, api_key], function(err,results){
		callback(err,results);
	});
};

var findUser = function(username, connection, callback){
	connection.query("select * from user where username = ?", [username], function(err,result){ 
            if ( !err ){
            	if ( result.length === 0 ){
            		return callback(err, null);
            	}else{
            		return callback(err,result[0]);
            	}
            }else{
            	return callback(err,result);
            }
        });
};

var findOrCreate = function(username, api_key, callback){

	dbPool.getConnection(function(err,connection){
        findUser(username, connection, function(err, user){
        	if ( !user ){
        		createUser(username, api_key, connection, function(err, results){
        			if ( !err ){
        				findUser(username, connection, function(err, user){
        					connection.release();
        					return callback(err, user);
        				});
        			}else{
        				connection.release();
        				return callback(err, results);
        			}
        		});
        	}else{
        		return callback(err, user);
        	}
        });
    });
};

module.exports = {
	findOrCreate: findOrCreate
};