var AppConfig          = require('../config/AppConfig');
var Logger             = require('log');
var Database           = require('../repository/Database');
var CacheRepository    = require('../repository/CacheRepository');
var HDWallet           = require('../lib/HDWallet');
var bitcore            = require('bitcore-lib-dash');
var BlockChainObserver = require('./BlockChainObserver');


var log = new Logger(AppConfig.logLevel)

var initialize = function(callback){

	Database.connect();

	CacheRepository.initialize(function(err, results){

		var pendingPayments;

		if ( err ){
			return callback(err, results);
		}else{

			log.info(results);
			BlockChainObserver.start();

			pendingPayments = CacheRepository.getPendingPayments();
			if ( pendingPayments.length > 0 ){
				for ( var i = 0 ; i < pendingPayments.length ; i++ ){
					BlockChainObserver.checkForPayment(pendingPayments[i]);
				}
			}else{
				log.debug('No pending payments to wait for.');
			}

			return callback(null, 'Dash Payment Service ready')
		}
	});
};

module.exports = {
	initialize: initialize
};