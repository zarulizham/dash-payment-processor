var AppConfig         = require('../config/AppConfig');
var Logger            = require('log');
var bitcore           = require('bitcore-lib-dash');
var log               = new Logger(AppConfig.logLevel);
var Wallet            = require('../lib/wallet');

var MerchantRepository = require('../repository/MerchantRepository');

var createNewAddress = function (apiKey, callback) {

    var wallet = new Wallet();

    MerchantRepository.findMerchantApi(apiKey, {}, function(err, res){
        if (err) return callback(err, null);

        wallet.initialize(res.wallet); // import server wallet for apiKey

        wallet.createAddress(function(err, res) {
            if (bitcore.Address.isValid(res.address)) {
                return callback(null, res.address.toString());
            }else{
                return callback('Unable to derive a proper deposit address.')
            }
        });
    });
};

module.exports = {
    createNewAddress: createNewAddress
};