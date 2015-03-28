// Test contracts written in javascript.

// NOTE: Real type not supported yet, but we don't have to worry here.

exports.getContracts = function(){
    var contracts = {};
    contracts['pevents'] = playerEvents;
    contracts['laws'] = laws;

    return contracts;
};

var playerEvents = new function(){

    var events = [];

    this.register = function(username, event){
        events.push({name: username, event: event});
        //printEvents();
    };

    this.sendTransaction = function(){
        return this;
    };

    this.call = function(){
        return this;
    };

    function printEvents(){
        console.log(events);
    }

};

var laws = new function(){

    var laws = {};



    this.create = function(creator, posX, posZ, radius){
        var law = {creator: creator, posX: posX, posZ: posZ, radius: radius};
        laws[creator] = law;
    };

    this.sendTransaction = function(){
        return this;
    };

    this.call = function(){
        return this;
    };

};

var users = new function(){

    var events = [];

    this.register = function(username, event){
        events.push({name: username, event: event});
        //printEvents();
    };

    this.sendTransaction = function(){
        return this;
    };

    this.call = function(){
        return this;
    };

};

var polls = new function(){

    this.sendTransaction = function(){
        return this;
    };

    this.call = function(){
        return this;
    };

};

var poll = new function(){
    var votersNames = {};
    var voters = [];

    var voteVal = 0;

};