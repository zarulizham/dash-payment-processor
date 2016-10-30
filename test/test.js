var bitcore = require('bitcore-lib-dash');
var should = require('chai').should();
// var HDWallet = require('../lib/HDWallet');
var Wallet = require('../lib/wallet');

var vec1_m_electrum_main = 'xpub661MyMwAqRbcGnGqkqqi5b8RaA6R6CZmCRz79UrBv3XEuCjbNNtJbs4h9hPmk27R9JY6dh7Fj2AMfRYw8fBp6CBSM39K8byPFZjJMoXQ4Zz';
var vec2_m_electrum_test = 'xpub661MyMwAqRbcFUcohorhMVaPQ4uxWANGv7EWb6suHiWJ7txVdqykGPJyQLAto3t7UWaTop3oaZJbvgVgmQZuivNYWSchhSyHmZZ5wShpD71';
var vec3_m_bitcore_main = 'drkvjJe5sJgqomjLnk5GECkZ5qhnfU2T1zUQaLZCh6kVPKk2CNSanUSxaTL9QRwDrD1WaMgzEWCZbZEL3mhQh8srYxLaGn7JDSofMWh1kJnk2yB';
var vec4_m_bitcore_test = 'DRKVrRjogj3bNiLD8UsktBH9SS9ihVNm1n7zxchfaFAP7ANmDM94J9e9Y99h6cMSipCvAXDcAdDvyxEgJqmnb3iva5CZq9Giwzd1eJ4Bwbd5MFed';

var vec1_m_electrum_main_imported = 'drkvjJe5sJgqomjLowaRpSBJT3LNnwRS97xHgAoiJVNxUeLY2YXKtUVfzBfV4sGQCc12HbghguTPxG2qoH8UX11k9eHxEPQQ3BqZuM7CtUuGXgq';
var vec2_m_electrum_test_imported = 'DRKVrRjogj3bNiLD8TpH8tmaVQBYhozpHGdqpYDMH1KetGhRNMHBUNtGuWCGGTT17r1dRUJEwiZU8mG4p2ZiruKky3UMXttn1XxHGET8fCmXcea8';

/* 12.1 (proposed) Test Vectors
var vec1_m_electrum_main_imported = 'dpubZ9169KDAEUnyp5Su4XRCH1BPNk3hDtbWdcneDWP79fRAj3xjuHmyKSmc4Dr9rHxc61KJqaP4VSQtnHggZ1LjFEwozR3G6z9rnDv1E9BVzMW';
var vec2_m_electrum_test_imported = 'DPUBxioaFQK3tpXxS6Jkp1wVViuYgXkiHMjdYJ7ZCEkivzJEt8fLzi1cFkcFQuZ6BfpNBE22LVcKpuMqNWyqbBuP9w28hURaFqLMoW98s5RJwj75';
*/

var vec1_m00_electrum_main = 'Xh1m1TksRAsxenqSob9m6hHKSqjV7Nim5u';
var vec1_m01_electrum_main = 'XeFVybHHsxfFDqJ27tB7JmgxbeVVV2q7DZ';
var vec1_m02_electrum_main = 'XcPfG1a1ZhR8nEGvjx57CVM1t5MNFR21q6';

var vec2_m00_electrum_test = 'ygewzEdUbAi3omVn361rSZhSBHCLrdocPS';
var vec2_m01_electrum_test = 'yLQ8AGDikXKhQ7jgKxCYzroYP6e8aGnAEN';
var vec2_m02_electrum_test = 'ygsTWo3jVN5vYYbYjE2Y6p4Cud6uJWGMzm';

var vec3_m00_bitcore_main = 'XwT9rRHbqXHPhN2H6G9ku9nnQjfxW3ytJu';
var vec3_m01_bitcore_main = 'XjJzo1LpX4f82hh6oVLeKnJpBXiuiGRztd';
var vec3_m02_bitcore_main = 'XrkPNVG5Hc1zs9ssdXMfWu3jAdegQSH8bD';

var vec4_m00_bitcore_test = 'yZRUMShkkTCwyBpnRZFzdv59oBsfmQmbaP';
var vec4_m01_bitcore_test = 'yQxHgSs42wgpsYJYhmd8EMKajEcYBBdxyv';
var vec4_m02_bitcore_test = 'yZFp4SwmqPPULcGS2hA2mi9659mRxy2nNT';

var serverWallet = '{"network":"testnet","xPrivKey":"tprv8ZgxMBicQKsPdELFtySdCVwuwQnN1xmvDZ67S5TQCSBNPeGWgju8XxSBotbbfkmvDEvCsDrBuUjye4iTLANwRze8auAZ1raBxnduHPASf5Z","xPubKey":"tpubDDb5nCWVNuPEbm9ztztimbb5PfZQmMJx4d1r4WaXfkTeTu6kVfToQL2CK5sGgyNPRcr9SmisQTe8kcd2jEh74i4N2UqfGthYvZgTkfRczFX","requestPrivKey":"0dac0c983ad80d23d42bb4eb009ddab21de5c1a6e8db1876eaefd44d2d0b357a","requestPubKey":"03097e5f97099568fe3fb3f31ab8d3eb95e693da92247025c5243acb2568de6da9","copayerId":"ba0147f148e2d029cb4e77a396933024c6f371afb36205938d5192012ef97cd1","publicKeyRing":[{"xPubKey":"tpubDDb5nCWVNuPEbm9ztztimbb5PfZQmMJx4d1r4WaXfkTeTu6kVfToQL2CK5sGgyNPRcr9SmisQTe8kcd2jEh74i4N2UqfGthYvZgTkfRczFX","requestPubKey":"03097e5f97099568fe3fb3f31ab8d3eb95e693da92247025c5243acb2568de6da9"}],"walletId":"31b6260b-61d8-4df6-84de-8c3eebd87fe5","walletName":"My Wallet","m":2,"n":2,"walletPrivKey":"cc493c8b2494f416f68be3a6e5aec33424824582b3ed872c06f852ea845313d7","personalEncryptingKey":"j1psdVjgiov8JRdx4BO9eg==","sharedEncryptingKey":"iwER8uqyB7cOCWcoyhJ4Vg==","copayerName":"Tomas","entropySource":"0df7b792ce8d30d74bbff0708b2221c6b0a0581649619a737e251632d5bcf095","derivationStrategy":"BIP44","account":0,"addressType":"P2SH"}';

/*

describe('IMPORT ELECTRUM-DASH MAINNET', function () {
    var hDPublicKey = HDWallet.ImportXPubKey(vec1_m_electrum_main, bitcore.Networks.mainnet);
    it('Import Serialized XPubKey', function () {
        hDPublicKey.xpubkey.should.equal(vec1_m_electrum_main_imported);
    });
    it('Derive User #1 Address (m/0/0)', function () {
        HDWallet.GetAddress(hDPublicKey, 0).toString().should.equal(vec1_m00_electrum_main);
    });
    it('Derive User #2 Address (m/0/1)', function () {
        HDWallet.GetAddress(hDPublicKey, 1).toString().should.equal(vec1_m01_electrum_main);
    });
    it('Derive User #3 Address (m/0/2)', function () {
        HDWallet.GetAddress(hDPublicKey, 2).toString().should.equal(vec1_m02_electrum_main);
    });
});

describe('IMPORT ELECTRUM-DASH TESTNET', function () {
    var hDPublicKey = HDWallet.ImportXPubKey(vec2_m_electrum_test, bitcore.Networks.testnet);
    it('Import Serialized XPubKey', function () {
        hDPublicKey.xpubkey.should.equal(vec2_m_electrum_test_imported);
    });
    it('Derive User #1 Address (m/0/0)', function () {
        HDWallet.GetAddress(hDPublicKey, 0).toString().should.equal(vec2_m00_electrum_test);
    });
    it('Derive User #2 Address (m/0/1)', function () {
        HDWallet.GetAddress(hDPublicKey, 1).toString().should.equal(vec2_m01_electrum_test);
    });
    it('Derive User #3 Address (m/0/2)', function () {
        HDWallet.GetAddress(hDPublicKey, 2).toString().should.equal(vec2_m02_electrum_test);
    });
});

describe('IMPORT BITCORE-DASH MAINNET', function () {
    var hDPublicKey = HDWallet.ImportXPubKey(vec3_m_bitcore_main, bitcore.Networks.mainnet);
    it('Import Serialized XPubKey', function () {
        bitcore.HDPublicKey.isValidSerialized(hDPublicKey.xpubkey, bitcore.Networks.mainnet).should.equal(true);
    });
    it('Derive User #1 Address (m/0/0)', function () {
        HDWallet.GetAddress(hDPublicKey, 0).toString().should.equal(vec3_m00_bitcore_main);
    });
    it('Derive User #2 Address (m/0/1)', function () {
        HDWallet.GetAddress(hDPublicKey, 1).toString().should.equal(vec3_m01_bitcore_main);
    });
    it('Derive User #3 Address (m/0/2)', function () {
        HDWallet.GetAddress(hDPublicKey, 2).toString().should.equal(vec3_m02_bitcore_main);
    });
});

describe('IMPORT BITCORE-DASH TESTNET', function () {
    var hDPublicKey = HDWallet.ImportXPubKey(vec4_m_bitcore_test, bitcore.Networks.testnet);
    it('Import Serialized XPubKey', function () {
        bitcore.HDPublicKey.isValidSerialized(hDPublicKey.xpubkey, bitcore.Networks.testnet).should.equal(true);
    });
    it('Derive User #1 Address (m/0/0)', function () {
        HDWallet.GetAddress(hDPublicKey, 0).toString().should.equal(vec4_m00_bitcore_test);
    });
    it('Derive User #2 Address (m/0/1)', function () {
        HDWallet.GetAddress(hDPublicKey, 1).toString().should.equal(vec4_m01_bitcore_test);
    });
    it('Derive User #3 Address (m/0/2)', function () {
        HDWallet.GetAddress(hDPublicKey, 2).toString().should.equal(vec4_m02_bitcore_test);
    });
});

*/

describe('Bitcore Wallet Service', function() {
    it('will initialize', function() {
        var wallet = new Wallet();
        wallet.initialize(serverWallet);
        wallet.should.not.equal(null);
    });

    /*
    it('will create a new address', function(done) {
        var wallet = new Wallet();
        wallet.createAddress(function(err, res) {
            res.address.should.not.equal(null);
            done();
        });
    });
    */

    it('will provide wallet tx history', function(done) {
        var wallet = new Wallet();
        wallet.initialize(serverWallet);
        wallet.getTxHistory(function(err, res) {
            res.should.not.equal(null);
            done();
        });
    });

    it('will provide wallet balance', function(done) {
        var wallet = new Wallet();
        wallet.initialize(serverWallet);
        wallet.getBalance(function(err, res) {
            res.should.not.equal(null);
            done();
        });
    });

    it('will provide wallet address txs', function(done) {
        var address = '8okrLdL6H8W8bzPYr164eps4q9Ah6boYbG';
        var wallet = new Wallet();
        wallet.initialize(serverWallet);
        wallet.getAddressTx(address, function(err, res) {
            res.should.not.equal(null);
            console.log(res);
            done();
        });
    });

    it('will provide join wallet', function(done) {
        var wallet = new Wallet();
        var opts = {
            name: 'uniquely generated id4',
            secret: '6U4t5hZdEEjPiTTKXNryEQXK47JFrz13sXyDDafWBE36TAAJoM3YYCV8ksngcJXVwgJeEbJuhdT'
        };
        wallet.joinWallet(opts, function(err, res) {
            res.should.not.equal(null);
            console.log(res);
            done();
        });
    });

});