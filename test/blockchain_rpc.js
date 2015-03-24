var bcrpc = require('../lib/blockchain_rpc');

var assert = require('assert');

describe('blockchain_rpc',function(){
    describe('#echo()',function(){
        var ECHO_STRING = "test";

        it("EPM rpc server should echo ECHO_STRING", function(done){
            var e;
            epm.echo(ECHO_STRING, function(echoString, err){
                if(err){
                    console.log("Error with echo call: " + err.toString());
                } else {
                    e = echoString;
                }
                assert.deepEqual(e,ECHO_STRING,"Did not get the right data.");
                done();
            });
        });

    });
});