var web3 = require('dapp-core');

web3.setProvider(new web3.providers.HttpProvider());

// BCU later, just mock for now, until poc9 clients are in working order again.
var playerEvents = new function(){

    var events = [];

    this.register = function(username, event){
        events.push({name: username, event: event});
        //printEvents();
    };

    function printEvents(){
        console.log(events);
    }

};

exports.registerPlayerEvent = function(username, event){
    playerEvents.register(username,event);
    return true;
};