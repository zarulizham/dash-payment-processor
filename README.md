# Dash Payment Service
***Please Note:*** *Documentation is a work in progress but actively maintained while the project is undergoing development.*

This is a Dash payment processor that can be run within your infrastructure to enable Dash payments as part of your customers' checkout experience. It is not customer facing, but rather a REST API that can be called by your backend server to handle Dash payments similar to how PayPal works. The entire process is made up up three components.

### The payment service (This application)
The payment service is a Node.js application that runs alongside bitcore-node-dash. The primary responsibilities of the service is to record payment requests, calculate current Dash valuations from various fiat currencies, manage payment address, and to notify your application when a payment has been made.

### Insight-API-Dash (Internal Dependency)
Insight-API-Dash is a blockchain explorer which acts a service to bitcore-node-dash. It is used to query the block chain, primarily to look for payments.

### Bitcore-Node-Dash (Internal Dependency)
Bitcore-Node-Dash is a wrapper to the Dash Core Daemon and is used to allow for direct interaction between various services and the Dash Blockchain.

## Download / Install / Run
To download and install this payment service:

    npm install -g bitcore-node-dash
    bitcore-node-dash create mynode -d ~/.bitcore/data
    cd mynode
    bitcore-node-dash install insight-api-dash
    bitcore-node-dash install dash-payment-service

After you have configured a database (see below), you can run the server by issuing the command:

    bitcore-node-dash start

## Testing
Test using Mocha

    npm install -g mocha

    npm test

## Database
The service stores persistent data in a MySQL database. The [schema](https://github.com/snogcel/dash-payment-service/blob/master/resources/mysql-schema.sql) is located in the `resources/` folder.

### Configuration

You'll need to create a database configuration file from a template. From the root of the project run:

    cd config/ ; cp DBConfig-template.js DBConfig.js ; cd -

Then, open `DBConfig.js` and supply your database credentials.

## Configuration
Application-level configuration, such as logging and external API endpoints is all maintained in `config/AppConfig.js`

### Insight
This application interacts with a local instance of Insight-API-Dash.

### Wallet Seed
You are respnsible for seeding the application with your Master Address Seed. This can be in BIP32 format, or Electrum format. Place the seed value in [AppConfig.js](https://github.com/snogcel/dash-payment-service/blob/master/config/AppConfig.js).

# Technical Docs

Developer documentation and endpoint specifications for clients can be found in the [wiki](https://github.com/snogcel/dash-payment-service/wiki).