var Client = require('bitcore-wallet-client-dash');
var fs = require('fs');

var BWS_INSTANCE_URL = 'http://localhost:3232/bws/api'

var secret = process.argv[2];
if (!secret) {
    console.log('./walletImport.js <Secret>')

    process.exit(0);
}

var client = new Client({
    baseUrl: BWS_INSTANCE_URL,
    verbose: false,
});

client.joinWallet(secret, "serverWallet", {}, function(err, wallet) {
    if (err) {
        console.log('error: ', err);
        return
    };

    console.log('Joined ' + wallet.name + '!');
    fs.writeFileSync('wallet.dat', client.export());

    client.openWallet(function(err, ret) {
        if (err) {
            console.log('error: ', err);
            return
        };
        console.log('\n\n** Wallet Info', ret);
    });
});