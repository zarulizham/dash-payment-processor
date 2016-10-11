var AppConfig      = require('../config/AppConfig');
var Logger         = require('log');
var dbPool        = require('../repository/Database').connect();

var log = new Logger(AppConfig.logLevel);

var generateReport = function(opts, callback){

    console.log(opts);

    if (!opts.xpubkey) {
        return callback('missing wallet seed', null);
    }

    if (opts.xpubkey != AppConfig.wallet.seed) {
        return callback('invalid wallet seed', null);
    }

    log.debug('Generating Report: ' + opts.xpubkey + " order by created_date " + opts.order);

    dbPool.getConnection(function(err,connection) {

        connection.query("SELECT * FROM receiver ORDER BY created_date " + opts.order + " LIMIT " + opts.limit, function(err,result){
            if ( !err ){
                console.log("success!");
                connection.release();

                if (result.length === 0) {
                    return callback(err, null);
                } else {
                    return callback(err, result);
                }

            } else {
                console.log("fail!");
                connection.release();

                return callback(err,result);
            }
        });

    });

};

module.exports = {
    generateReport: generateReport
};