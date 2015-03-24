// BCU later, just mock for now, until poc9 clients are in working order again.
var playerEvents = new function(){

    var events = [];

    this.register = function(username, event){
        events.push({name: username, event: event});
        printEvents();
    };

    function printEvents(){
        console.log(events);
    }

};

exports.registerPlayerEvent = function(username, event){
    playerEvents.register(username,event);
    return true;
};