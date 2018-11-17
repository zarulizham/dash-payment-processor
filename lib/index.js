'use strict';

var Writable = require('stream').Writable;
var bodyParser = require('body-parser');
var compression = require('compression');
var BaseService = require('./service');
var inherits = require('util').inherits;
var morgan = require('morgan');
var bitcore = require('bitcore-lib-dash');
var _ = bitcore.deps._;
var $ = bitcore.util.preconditions;

var Wallet = require('../lib/wallet');
var AppConfig = require('../config/AppConfig');
var Bootstrap = require('../service/Bootstrap');
var UserService = require('../service/UserService');
var MerchantService = require('../service/MerchantService');
var ReceiverService = require('../service/ReceiverService');
var DashValuationService = require('../service/DashValuationService');
var ReportingService = require('../service/ReportingService');
var EventEmitter = require('events').EventEmitter;


/**
 * A service for Bitcore to enable decentralized payment processing.
 */
var DashPaymentService = function(options) {
    BaseService.call(this, options);

    if (!_.isUndefined(options.routePrefix)) {
        this.routePrefix = options.routePrefix;
    } else {
        this.routePrefix = this.name;
    }

    this.subscriptions = {
        dps: []
    };

};

DashPaymentService.dependencies = ['dashd', 'web'];

inherits(DashPaymentService, BaseService);


DashPaymentService.prototype.getRoutePrefix = function() {
    return this.routePrefix;
};

DashPaymentService.prototype.start = function(callback) {
    var self = this;

    this.node.services.dashd.on('tx', this.transactionEventHandler.bind(this));
    this.node.services.dashd.on('txlock', this.transactionLockEventHandler.bind(this));
    this.node.services.dashd.on('block', this.blockEventHandler.bind(this));

    Bootstrap.initialize(function(err, results){
        if ( err ){
            self.node.log.error(err);
            process.exit(1);
        }else{
            self.node.log.info(results);
        }
    });

    setImmediate(callback);
};

DashPaymentService.prototype.createLogInfoStream = function() {
    var self = this;

    function Log(options) {
        Writable.call(this, options);
    }
    inherits(Log, Writable);

    Log.prototype._write = function (chunk, enc, callback) {
        self.node.log.info(chunk.slice(0, chunk.length - 1)); // remove new line and pass to logger
        callback();
    };
    var stream = new Log();

    return stream;
};

DashPaymentService.prototype.getRemoteAddress = function(req) {
    if (req.headers['cf-connecting-ip']) {
        return req.headers['cf-connecting-ip'];
    }
    return req.socket.remoteAddress;
};

DashPaymentService.prototype.setupRoutes = function(app) {

    var self = this;

    //Setup logging
    morgan.token('remote-forward-addr', function(req){
        return self.getRemoteAddress(req);
    });
    var logFormat = ':remote-forward-addr ":method :url" :status :res[content-length] :response-time ":user-agent" ';
    var logStream = this.createLogInfoStream();
    app.use(morgan(logFormat, {stream: logStream}));

    //Enable compression
    app.use(compression());

    //Enable urlencoded data
    app.use(bodyParser.urlencoded({extended: true}));

    //Enable CORS
    app.use(function(req, res, next) {

        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, HEAD, PUT, POST, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Content-Length, Cache-Control, cf-connecting-ip');

        var method = req.method && req.method.toUpperCase && req.method.toUpperCase();

        if (method === 'OPTIONS') {
            res.statusCode = 204;
            res.end();
        } else {
            next();
        }
    });

    // Create Receiver
    app.post('/createReceiver', function(req,res){

        // check if HD Wallet is set
        if ( AppConfig.wallet ) {
            var api_key = 'SELF_HOSTED';
        } else {
            var api_key = req.body.api_key;
        }

        var fiatCode    = req.body.currency;
        var fiatAmount  = req.body.amount;
        var username    = req.body.username;
        var description = req.body.description;
        var callbackUrl = req.body.callbackUrl;

        var user = UserService.findOrCreate(username, api_key, function(err, user){
            if ( err ){
                res.send(err);
            }else{
                ReceiverService.createReceiver(api_key, username, fiatCode, fiatAmount, description, callbackUrl, function(err, receiver){
                    if ( err ){
                        res.send(err);
                    }else{
                        ReceiverService.listenForPayment(receiver);
                        res.jsonp({
                            receiver_id: receiver.receiver_id,
                            username: receiver.username,
                            dash_payment_address: receiver.dash_payment_address,
                            amount_fiat: receiver.amount_fiat,
                            type_fiat: receiver.type_fiat,
                            base_fiat: receiver.base_fiat,
                            amount_duffs: receiver.amount_duffs,
                            created_date: receiver.created_date,
                            description: receiver.description
                        });
                    }
                });
            }
        });
    });

    // Report Generation - enable only for testing.
    /*
    app.post('/generateReport', function(req, res) {

        var opts = {};
        opts.xPubKey = req.body.xPubKey;

        ReportingService.generateReport(opts, function(err, result) {
            if(err) {
                res.status(404).jsonp({
                    status: 404,
                    url: req.originalUrl,
                    error: err
                });
            }

            if(result) {
                res.jsonp(result);
            }

        });

    });
    */

    // Dash Valuation Service
    app.post('/valuationService', function(req, res) {
        var fiatCode = req.body.fiatCode || 'USD';

        DashValuationService.getCurrentValue(fiatCode, function(err, value) {
            if (err) {
                console.log(err);
            } else {
                res.jsonp({ fiatCode: fiatCode, value: value });
            }
        });
    });

    // Merchant Account Creation
    app.post('/createMerchant', function(req, res) {

        var wallet = new Wallet();

        var opts = {
            username: req.body.username,
            secret: req.body.secret
        };

        // TODO - check if secret has already been shared with dash payment processor

        wallet.joinWallet(opts, function(err, result) {
           if(err) {
               res.send(err);
           } else {
               var api_key = result.api_key;
               var username = result.username;
               MerchantService.findOrCreateMerchant(result.api_key, result.wallet, function(err, result) {
                   if (err) {
                       res.send(err);
                   } else {
                       res.jsonp({
                           api_key: api_key,
                           username: username
                       });
                   }
               });
           }
        });
    });

    /**
     *   Example callback URL - Not for use in a production environment. This endpoint is used only for testing, to output the
     *   the results of a callback URL without having to run a completely separate server during development.
     */
    app.post('/cb', function(req,res){

        for (var i = 0; i < self.subscriptions.dps.length; i++) {
            self.subscriptions.dps[i].emit('callback', JSON.stringify(req.body, null, 3));
        }

        console.log('**********************************************************************************************');
        console.log('Received a call from the payment gateway - a payment must have been made.');
        console.log('**********************************************************************************************');
        console.log(JSON.stringify(req.body, null, 3));
        console.log('**********************************************************************************************');

        res.jsonp('OK')

    });

    // Not Found
    app.use(function(req, res) {
        res.status(404).jsonp({
            status: 404,
            url: req.originalUrl,
            error: 'Not found'
        });
    });

};

DashPaymentService.prototype.getPublishEvents = function() {
    return [
        {
            name: 'dps',
            scope: this,
            subscribe: this.subscribe.bind(this),
            unsubscribe: this.unsubscribe.bind(this),
            extraEvents: ['callback']
        }
    ];
};

DashPaymentService.prototype.subscribe = function(emitter) {
    $.checkArgument(emitter instanceof EventEmitter, 'First argument is expected to be an EventEmitter');

    var emitters = this.subscriptions.dps;
    var index = emitters.indexOf(emitter);
    if(index === -1) {
        emitters.push(emitter);
    }
};

DashPaymentService.prototype.unsubscribe = function(emitter) {
    $.checkArgument(emitter instanceof EventEmitter, 'First argument is expected to be an EventEmitter');

    var emitters = this.subscriptions.dps;
    var index = emitters.indexOf(emitter);
    if(index > -1) {
        emitters.splice(index, 1);
    }
};

DashPaymentService.prototype.blockEventHandler = function(hashBuffer) {

};

DashPaymentService.prototype.transactionEventHandler = function(txBuffer) {

};

DashPaymentService.prototype.transactionLockEventHandler = function(txBuffer) {

};


module.exports = DashPaymentService;
