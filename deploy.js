var web3 = require('./node_modules/ethereum.js/index');
var path = require('path');
// var fs = require('fs');

web3.setProvider(new web3.providers.HttpProvider('http://localhost:8080'));

var bcu = require('bcu');

bcu.initBCU(web3);

var address = web3.eth.accounts[0];
console.log("Active address: " + address);
//Deploy contracts.
(function(){

    if(address === undefined){
        throw new Error("Account address is undefined - is the blockchain client running?");
    }

    // Using default values.
    var deploymentData = {
        contracts : ['pevents','laws'],
        abis : ['pevents','laws'],
        options : {
            contractsPath : path.join(__dirname, 'contracts/'),
            abiPath : path.join(__dirname, 'contracts/abi/')
        }
    };

    var deployer = new bcu.Deployer(deploymentData);

    deployer.start(depCallback);

    function depCallback(success, message, ret){
        if(success){
            console.log("Deployed successfully");

        } else {
            console.log("Deployment failed: " + message);
        }
    }

})();