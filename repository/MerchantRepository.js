var dbPool        = require('./Database').connect();
var Logger        = require('log');
var AppConfig     = require('../config/AppConfig');

var log = new Logger(AppConfig.logLevel)


var createMerchant = function(apiKey, wallet, connection, callback){
    log.debug('Creating merchant ' + apiKey);
    connection.query("insert into merchant set apiKey = ?, wallet = ?, created_date = NOW()", [apiKey, wallet], function(err,results){
        callback(err,results);
    });
};

var findMerchant = function(apiKey, wallet, connection, callback){
    connection.query("select * from merchant where apiKey = ?", [apiKey], function(err,result){
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

var findOrCreateMerchant = function(apiKey, wallet, callback){

    dbPool.getConnection(function(err,connection){
        findMerchant(apiKey, wallet, connection, function(err, user){
            if ( !user ){
                createMerchant(apiKey, wallet, connection, function(err, results){
                    if ( !err ){
                        findMerchant(apiKey, wallet, connection, function(err, user){
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
    findOrCreateMerchant: findOrCreateMerchant
};