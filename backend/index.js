var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io').listen(http);
var RSA = require('hybrid-crypto-js').RSA;
var Crypt = require('hybrid-crypto-js').Crypt;

var rsa = new RSA();
var crypt = new Crypt({md:'sha256'});


var privateKey;
var decrypted;

app.get('/', function(req, res){
   res.send("Hello world!");
});

io.on('connection', (socket) => {
    
    console.log('a user connected');
    //Server Key Request from Client
    socket.on("ReqServerKey", () => {
        // console.log("Server Key Requested");
        
        rsa.generateKeyPairAsync().then(keys => {
            io.emit("ServerPublic",keys.publicKey);
            // console.log(keys.publicKey);
            privateKey = keys.privateKey;
        })
        .catch(error => {
            console.log(error);
        });

    })
    //Receiving Encrypted Message and Decrypting it
    socket.on("Transaction", (encrypted) => {
        decrypted = crypt.decrypt(privateKey, encrypted);
        console.log(decrypted);
    })

});  

http.listen(3000, () => {
    console.log('listening on *:3000');
  });