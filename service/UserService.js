var AppConfig      = require('../config/AppConfig');
var Logger         = require('log');
var UserRepository = require('../repository/UserRepository');

var log = new Logger(AppConfig.logLevel)

var findOrCreate = function(username,api_key,callback){
	UserRepository.findOrCreate(username,api_key,function(err,results){
		callback(err,results);
	});
};

module.exports = {
	findOrCreate: findOrCreate
};