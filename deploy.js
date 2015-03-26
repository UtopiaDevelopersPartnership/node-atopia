var web3 = require('web3');

web3.setProvider(new web3.providers.HttpProvider('http://localhost:8080'));

var bcu = require('dapp-core');

bcu.initBCU(web3);

var address = web3.eth.accounts[0];

//Deploy contracts.
(function(){

    if(address === undefined){
        throw new Error("Account address is undefined - is the blockchain client running?");
    }

    // Using default values.
    var deploymentData = {
        contracts : ['doug','pevents'],
        abis : ['doug','pevents'],
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