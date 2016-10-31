var dbPool        = require('./Database').connect();
var Logger        = require('log');
var AppConfig     = require('../config/AppConfig');

var log = new Logger(AppConfig.logLevel)


var createMerchant = function(api_key, wallet, connection, callback){
    log.debug('Creating merchant ' + api_key);
    connection.query("insert into merchant set api_key = ?, wallet = ?, created_date = NOW()", [api_key, wallet], function(err,results){
        callback(err,results);
    });
};

var findMerchant = function(api_key, wallet, connection, callback){
    connection.query("select * from merchant where api_key = ?", [api_key], function(err,result){
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

var findMerchantApi = function(api_key, wallet, callback){

    dbPool.getConnection(function(err,connection){
        findMerchant(api_key, wallet, connection, function(err, result){
            if ( !result ){
                return callback('Error: Merchant API Not Found.', null);
            }else{
                return callback(err, result);
            }
        });
    });
};

var findOrCreateMerchant = function(api_key, wallet, callback){

    dbPool.getConnection(function(err,connection){
        findMerchant(api_key, wallet, connection, function(err, user){
            if ( !user ){
                createMerchant(api_key, wallet, connection, function(err, results){
                    if ( !err ){
                        findMerchant(api_key, wallet, connection, function(err, user){
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
    findOrCreateMerchant: findOrCreateMerchant,
    findMerchantApi: findMerchantApi
};