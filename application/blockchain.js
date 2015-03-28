var web3 = require('../node_modules/ethereum.js/index');

var fs = require('fs');

var nconf = require('nconf');

web3.setProvider(new web3.providers.HttpProvider('http://localhost:8080'));

//nconf.argv().env().file({ file: '../dapp.json' });

var pe;

var JS_TESTS = false;

var contracts = {};

(function initContracts(){
    if(JS_TESTS === false) {
        nconf.argv().env().file({file: '../contracts/config.json'});
        var cfc = nconf.get('contracts');
        console.log("Loading contracts");
        for(var i = 0; i < cfc.length; i++) {
            var c = cfc[i];
            var cName = c.name;
            var cAddress = c.address;
            console.log("Name:" + cName);
            console.log("Address: " + cAddress);
            var abiObj = loadContractAbi(cName);

            var Factory = web3.eth.contract(abiObj);
            contracts[cName] = new Factory(cAddress);
        }
        //contracts['pevents'].sendTransaction().register("Tester", "login");
        //console.log(contracts['pevents'].call().getLogEntry(0));
        //registerPlayerEvent("Tester23423","login");

        function loadContractAbi(fileName) {
            var fileData;
            var abiObj;
            try {
                fileData = fs.readFileSync('../contracts/abi/' + fileName + ".json", "utf8");
                abiObj = JSON.parse(fileData);
            } catch (err) {
                console.log(err);
                return null;
            }
            return abiObj;
        }
    } else {
        contracts = require('./testcontracts').getContracts();
    }
})();

exports.registerPlayerEvent = function(username, event, callback){
    var pe = contracts['pevents'];
    var f = pe.EventRegistered({userName: username, eventType: event});
    f.watch(function(data, evt){
        var args = evt.args;
        var argsCode = args.code.toString();
        f.stopWatching();
        callback(argsCode);
    });
    pe.sendTransaction().register(username,event);
};

exports.createLaw = function(creator, posX, posZ, radius, callback){
    var laws = contracts['laws'];
    var f = laws.AddLaw({creator: creator});
    f.watch(function(data, evt){
        console.log(evt);
        var args = evt.args;
        var argsCode = args.code.toString();
        f.stopWatching();
        callback(argsCode);
    });

    laws.sendTransaction().addLaw(creator, posX, posZ, radius);
    return true;
};

exports.abandonLaw = function(creator, callback){
    var laws = contracts['laws'];
    var f = laws.RemoveLaw({creator: creator});
    f.watch(function(data, evt){
        console.log(evt);
        var args = evt.args;
        var argsCode = args.code.toString();
        f.stopWatching();
        callback(argsCode);
    });

    laws.sendTransaction().removeLaw(creator);
    return true;
};