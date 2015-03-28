// JSON RPC error codes.
var PARSE_ERROR = -32700;
var INVALID_REQUEST = -32600;
var METHOD_NOT_FOUND = -32601;
var INVALID_PARAMS = -32602;
var INTERNAL_ERROR = -32603;

var bc = require('./blockchain');

var WebSocketServer = require('ws').Server;

var wss = new WebSocketServer({ port: 3000 });

var handlers = {};

handlers["server_echo"] = function(req, callback){
    var params = req.params;
    if(params.length !== 1 || typeof params[0] !== "string"){
        return getErrResponse(req.id, INVALID_PARAMS, "Params not an array with single string entry.");
    }
    callback(getResponse(req.method, {message: params[0]}));
};

// TODO async for txs and do the event filters/watches when blockchain client is good to go.
handlers["playerEvents_register"] = function(req, callback){
    var params = req.params;
    if(params.length !== 2 || typeof params[0] !== "string" || typeof params[1] !== "string"){
        callback(getErrResponse(req.id, INVALID_PARAMS, "Params not an array [string, string]."));
    }
    bc.registerPlayerEvent(params[0],params[1], function(status){
        if(status !== '201'){
            callback(getErrResponse(req.id, INTERNAL_ERROR, "Failed to add player event to contract. Status: " + status));
        } else {
            callback(getResponse(req.method, {userName: params[0], eventType: params[1]}));
        }
    });

};

handlers["laws_create"] = function(req, callback){
    var params = req.params;
    if(params.length !== 4 || typeof params[0] !== "string" || typeof params[1] !== "number" ||
        typeof params[2] !== "number" || typeof params[3] !== "number" ){
        callback(getErrResponse(req.id, INVALID_PARAMS, "Params not an array [string, number, number, number]."));
    }
    bc.createLaw(params[0],params[1],params[2],params[3], function(status){
        if(status !== "201"){
            callback(getErrResponse(req.id, INTERNAL_ERROR, "Failed to add law to contract. Status: " + status));
        } else {
            callback(getResponse(req.method, {creator: params[0], posX: params[1], posZ: params[2], radius: params[3]}));
        }
    });
};

handlers["laws_abandon"] = function(req, callback){
    var params = req.params;
    if(params.length !== 1 || typeof params[0] !== "string"){
        callback(getErrResponse(req.id, INVALID_PARAMS, "Params not an array [string]."));
    }
    bc.abandonLaw(params[0], function(status){
        if(status !== "200"){
            callback(getErrResponse(req.id, INTERNAL_ERROR, "Failed to abandon law. Status: " + status));
        } else {
            callback(getResponse(req.method, {creator: params[0]}));
        }
    });
};

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(msg) {
        console.log("Receiving message: " + msg);
        var response = "";
        try {
            var req = JSON.parse(msg);
            if (!validateRequest(req)) {
                response = getErrResponse(req.id || -1, INVALID_REQUEST, "Request is invalid: " + msg);
            } else {
                var handler = handlers[req.method];
                if (!handler) {
                    response = getErrResponse(msg.id, METHOD_NOT_FOUND, "Method not found: " + req.message);
                } else {
                    // Pass to handler /w callback.
                    handler(req, function(respObj){
                        console.log("Response: " + respObj);
                        ws.send(JSON.stringify(respObj));
                    });
                }
            }
        } catch (err) {
            console.log(err);
            response = getErrResponse(-1, PARSE_ERROR, "Request could not be parsed: " + msg);
        }
        if (response !== "") {
            console.log("Response: " + response);
            ws.send(response);
        }
    });
    console.log("Websocketing");
});

function validateRequest(request){
    return  typeof request.id === "number" &&
            typeof request.jsonrpc === "string" &&
            request.jsonrpc === "2.0" &&
            typeof request.method === "string" &&
            request.params instanceof Array;
}

function getResponse(id, result){
    return JSON.stringify({
        id: id,
        jsonrpc: "2.0",
        result: result
    });
}

function getErrResponse(id, code, msg, data){
    return JSON.stringify({
        id: id,
        jsonrpc: "2.0",
        error: {
            code: code,
            message: msg,
            data: data
        }
    });
}

/*
 Json rpc stuff from server

 Request struct {
     ID      interface{}     `json:"id"`
     JsonRpc string          `json:"jsonrpc"`
     Method  string          `json:"method"`
     Params  *json.RawMessage `json:"params"`
 }

 Response struct {
     ID      interface{}  `json:"id"`
     JsonRpc string       `json:"jsonrpc"`
     Result  interface{}  `json:"result"`
     Error   *ErrorObject `json:"error"`
 }

ErrorObject struct {
    Code    int    `json:"code"`
    Message string `json:"message"`
}
 */