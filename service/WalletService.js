var AppConfig         = require('../config/AppConfig');
var Logger            = require('log');
var bitcore           = require('bitcore-lib-dash');
var log               = new Logger(AppConfig.logLevel);
var CounterRepository = require('../repository/CounterRepository');
var HDWallet          = require('../lib/HDWallet');
var Wallet            = require('../lib/wallet');

var MerchantRepository = require('../repository/MerchantRepository');

var createNewAddress = function (api_key, callback) {

    var wallet = new Wallet();

    MerchantRepository.findMerchantApi(api_key, {}, function(err, res){
        if (err) return callback(err, null);

        wallet.initialize(res.wallet); // import server wallet for api_key

        wallet.createAddress(function(err, res) {
            if (bitcore.Address.isValid(res.address)) {
                return callback(null, res.address.toString());
            }else{
                return callback('Unable to derive a proper deposit address.')
            }
        });
    });
};

var getNextAddress = function (callback) {

    CounterRepository.getAndIncrement('hd-wallet-child', function(err, child){

        log.debug('Getting new deposit address at position ' + child + ' with seed: ' + AppConfig.wallet.seed);

        // Generate the next address (using Electrum's m/0/i paths for receiving addresses)
        // (returns Bitcore Address object: https://bitcore.io/api/lib/address)
        var nextAddress = HDWallet.GetAddress(AppConfig.wallet.seed, child);

        if (bitcore.Address.isValid(nextAddress)) {
            return callback(null, nextAddress.toString());
        }else{
            return callback('Unable to derive a proper deposit address.')
        }
    });
};

module.exports = {
    createNewAddress: createNewAddress,
    getNextAddress: getNextAddress
};