var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('D:/config');
var fs = require('fs');

 // Instantiate the HTTP server
 var httpServer = http.createServer(function(req,res){
    unifiedServer(req,res);
  });
  
  // Start the HTTP server
  httpServer.listen(config.httpPort,function(){
     console.log('The HTTP server is running on port '+config.httpPort+' in '+config.envname+' node');
  });
  
  // Instantiate the HTTPS server
  var httpsServerOptions = {
    'key': fs.readFileSync('D:/https/key.pem'),
    'cert': fs.readFileSync('D:/https/cert.pem')
  };
  var httpsServer = https.createServer(httpsServerOptions,function(req,res){
    unifiedServer(req,res);
  });
  
  // Start the server based on  config
  httpsServer.listen(config.httpsPort,function(){
    console.log('The server is up and running now on port '+config.httpsPort+' in '+config.envname+' node');
  });

//unified server
var unifiedServer = function(req,res)
{
    //parse the url
     var parsedUrl =  url.parse(req.url,true);

     //Get the pathc and trimm the url
     var pathName = parsedUrl.pathname;
     var trimmedUrl = pathName.replace(/^\/+|\/+$/g, '');
     
     //Get the query string as Object
     var queryStringObject = parsedUrl.query;

     // Get the HTTP method
     var method = req.method.toLowerCase();

    //Get the headers as an object
    var headers = req.headers;

    //Get Payload,if it is present
    var decoder = new StringDecoder('utf-8');
    var buffer='';
    req.on('data', function(data){
        buffer+= decoder.write(data);
    });
    req.on('end',function()
    {
        buffer+= decoder.end();
    })

    //chose handler to know where the request should land
    var chosenHandler= typeof(router[trimmedUrl]) != 'undefined' ? router[trimmedUrl]: handlers.notFound;

    // Construct data object to give to handler
    var data={
        'trimmedUrl' : trimmedUrl,
        'queryStringObject' : queryStringObject,
        'method' : method,
        'headers' : headers,
        'payload' : buffer
    };

     //Route the requets to the handler specified in handler
     chosenHandler(data,function(statusCode,payload)
     {
       //use the status code given by handler or use default as 200
       statusCode = typeof(statusCode) == "number" ?statusCode :200 ;
       //use the paylaod as defined by the handler else define it as empty handler
       payload = typeof(payload) == "object" ? payload: {};

       //convert payload to string 
       var payloadstring = JSON.stringify(payload);
        // Send the response
        res.setHeader('Content-Type', 'application/html');
        res.writeHead(statusCode);
        res.end(payloadstring);

        
     // Log the request/response
     console.log('Request the response: ',statusCode,payloadstring);

     });
       
}

var handlers = {};
handlers.hello= function(data,callback){
 //callback giving status code and msg
    callback(200,{'message': 'Hello world'})   ;
}
handlers.notFound = function(data,callback)
{
callback(404);
};
//defining a router
var router = {
    'hello' : handlers.hello
  };