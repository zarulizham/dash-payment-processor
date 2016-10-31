var AppConfig      = require('../config/AppConfig');
var Logger         = require('log');
var MerchantRepository = require('../repository/MerchantRepository');

var log = new Logger(AppConfig.logLevel)

var findOrCreateMerchant = function(api_key, wallet, callback){
    MerchantRepository.findOrCreateMerchant(api_key, wallet,function(err,results){
        callback(err,results);
    });
};

module.exports = {
    findOrCreateMerchant: findOrCreateMerchant
};