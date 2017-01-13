var env = process.env.NODE_ENV || 'development';
var bitcore = require('bitcore-lib-dash');

var config = {
    development: {
        app: {
            name: 'dash-payment-processor'
        },
        insight: 'http://localhost:3001/',
        wallet: {
            seed: 'tpubD6NzVbkrYhZ4XF76ticXpsfZ1fKVpqfrLFCw5PCGmBtpf7ChFyzEH4HzuQ4pAvUMNfFVSh8P8J1am1Bb8s8ifk76CD6aS2Xr4SpRnDmummj', // ELECTRUM or BIP32
            network: bitcore.Networks.testnet
        },
        port: process.env.PORT || 9001,
        logLevel: 'DEBUG', // EMERGENCY|ALERT|CRITICAL|ERROR|WARNING|NOTICE|INFO|DEBUG
        worldcoin: {
            name: 'WorldCoinIndex',
            orgUrl: 'https://www.worldcoinindex.com',
            url: 'https://www.worldcoinindex.com/apiservice/json',
            apiKey: '' // get one from https://www.worldcoinindex.com/apiservice
        }
    },
    production: {
        app: {
            name: 'dash-payment-processor'
        },
        insight: 'http://localhost:3001/',
        wallet: {
            seed: 'xpub661MyMwAqRbcEorCw5Bqik47NhE4RCgCgxqvM3DqfpUvVo7dEk7HL5BmqLJCT4EvBUK2pTewJjpd4Z64nXDTaqQuAhuYH4PFdTenCkHzuQa', // ELECTRUM or BIP32
            network: bitcore.Networks.mainnet
        },
        port: process.env.PORT || 9001,
        logLevel: 'ERROR', // EMERGENCY|ALERT|CRITICAL|ERROR|WARNING|NOTICE|INFO|DEBUG
        worldcoin: {
            name: 'WorldCoinIndex',
            orgUrl: 'https://www.worldcoinindex.com',
            url: 'https://www.worldcoinindex.com/apiservice/json',
            apiKey: '' // get one from https://www.worldcoinindex.com/apiservice
        }
    }
};

module.exports = config[env];
