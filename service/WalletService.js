var AppConfig         = require('../config/AppConfig');
var Logger            = require('log');
var bitcore           = require('bitcore-lib-dash');
var log               = new Logger(AppConfig.logLevel);
var Wallet            = require('../lib/wallet');

var createNewAddress = function (callback) {

    var wallet = new Wallet();
    wallet.initialize();

    wallet.createAddress(function(err, res) {
        if (bitcore.Address.isValid(res.address)) {
            return callback(null, res.address.toString());
        }else{
            return callback('Unable to derive a proper deposit address.')
        }
    });
};

module.exports = {
    createNewAddress: createNewAddress
};