'use strict';

var _ = require('lodash');
var AppConfig = require('../config/AppConfig');
var Client = require('bitcore-wallet-client-dash');
var fs = require('fs');
var path = require("path");
var request = require('request');

var BWS_INSTANCE_URL = 'http://localhost:3232/bws/api';
var INVALID_WALLET_STATUS = 'Invalid Wallet Status';
var INVALID_WALLET = 'Invalid Wallet';

var Wallet = function() {
    this.initialized = false;
    this.xPubKey = null;

    this.client = new Client({
        baseUrl: BWS_INSTANCE_URL,
        verbose: false
    });
};

/**
 * Initialize Server Wallet
 *
 * @param wallet - (optional) allows for wallet to be passed as object
 */
Wallet.prototype.initialize = function(wallet) {
    if (wallet) {
        try {
            this.client.import(wallet);
            this.xPubKey = this.client.credentials.xPubKey;
            this.initialized = true;

        } catch (e) {
            throw(INVALID_WALLET);
        }
    } else {
        try {
            var wallet = fs.readFileSync(path.join(__dirname, '../config/') + 'wallet.dat', 'utf-8');
            this.client.import(wallet);
            this.xPubKey = this.client.credentials.xPubKey;
            this.initialized = true;

        } catch (e) {
            throw(INVALID_WALLET);
        }
    }
};

/**
 * Create Payment Address
 *
 */
Wallet.prototype.createAddress = function(cb) {
    var client = this.client;

    client.openWallet(function(err, res) {
        if (err) {
            return cb(err, null);
        }

        if (res.wallet.status == 'complete') {
            client.createAddress({}, function(err,res){
                if (err) {
                    return cb(err, null);
                }
                return cb(null, res); // return new address
            });
        } else {
            return cb(INVALID_WALLET_STATUS, null);
        }
    });
};

/**
 * Retrieve TX History
 *
 */
Wallet.prototype.getTxHistory = function(cb) {
    var client = this.client;

    client.openWallet(function(err, res) {
        if (err) {
            return cb(err, null);
        }

        if (res.wallet.status == 'complete') {
            client.getTxHistory({}, function(err,res){
                if (err) {
                    return cb(err, null);
                }
                return cb(null, res); // return tx history
            });
        } else {
            return cb(INVALID_WALLET_STATUS, null);
        }
    });
};

/**
 * Retrieve Wallet Balance
 *
 */
Wallet.prototype.getBalance = function(cb) {
    var client = this.client;

    client.openWallet(function(err, res) {
        if (err) {
            return cb(err, null);
        }

        if (res.wallet.status == 'complete') {
            client.getBalance({}, function(err,res){
                if (err) {
                    return cb(err, null);
                }
                return cb(null, res); // return wallet balance
            });
        } else {
            return cb(INVALID_WALLET_STATUS, null);
        }
    });
};



/**
 * Retrieve Address Transactions
 *
 */
Wallet.prototype.getAddressTx = function(address, cb) {
    var url = AppConfig.insight + 'insight-api-dash/txs/?address=' + address;

    request.get(url, function (err, response, body) {
        if ( !err && response.statusCode == 200 ){
            var tx = JSON.parse(body);
            return cb(null, tx);
        }else{
            return cb(err, null);
        }
    });
};

module.exports = Wallet;
