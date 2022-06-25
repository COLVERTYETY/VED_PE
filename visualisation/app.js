#!/usr/bin/env node

var net = require('net');
var HOST = '0.0.0.0';
var PORT = 8080;

// the usual
const express = require('express');
const path = require('path');
const app = express();

// socket io
const http = require('http');
const server = http.createServer(app);
const {Server} = require('socket.io');
const { Console } = require('console');
const io = new Server(server);

// data buffer
var buffer = ""
// time stamp to evaluate rate of data
var last_timestamp = 0;

// fils system
const fs = require('fs'); 
var databuffer="";

// databackup timer 60s
const interval = setInterval(function() {
    // if last message received is over 30s old
    if( ((Date.now() - last_timestamp) >30000) && (databuffer.length>0)){
        var title = "DATA/"+ new Date().toISOString() +".csv";
        title=title.replace(/:/g,"_");
        // title=title.replace(/./g,"_");
        fs.writeFile(title,databuffer,function (err,data) {
            if (err) {
              return console.log(err);
            }
            console.log("DATA SAVED SUCESSFULLY !!");
          });
        databuffer="";
    }
  }, 60000);


app.get('/lines', function(req, res) {
    res.sendFile(path.join(__dirname, '/lines.html'));
});


app.get('/status', function(req, res) {
    res.sendFile(path.join(__dirname, '/status.html'));
});

// handle static assets
app.use(express.static(__dirname));



// connect socket
io.on('connection', function(socket) {
    console.log('a user connected');
});

// we start the server last so that we can use the socket
server.listen(9999, () => {
    console.log('Server started at http://localhost:' + 9999);
})

net.createServer(function(sock) {
    console.log('CONNECTED DATA:',sock.remoteAddress,':',sock.remotePort);
    last_timestamp = Date.now();
    sock.setEncoding("utf8"); //set data encoding (either 'ascii', 'utf8', or 'base64')
    sock.on('data', function(data) {
        // console.log(data);
        buffer += data; // for packet reconstitution
        // console.log(buffer);
        // isolate a valid json
        var json = buffer.match(/^\{.*\}/);
        if(json && json.length > 0) {
            var now = Date.now();
            // add the data to databuffer in csv format
            databuffer+=json+"\n"
            // print the rate of data without skipping lines
            // console.log("rate is: "+ (now - last_timestamp)+"ms\r");
            buffer = "";
            // console.log(json);
            try {
                const parsed_data = JSON.parse(json[0])
                parsed_data["time"] = now;
                last_timestamp = now;
                // console.log(parsed_data)
                // check if a socketio is open
                io.emit('data', parsed_data);
            } catch(err) {
                console.error(err)
                }
            }
    });

}).listen(PORT, HOST, function() {
    console.log("server accepting connections from device");
});