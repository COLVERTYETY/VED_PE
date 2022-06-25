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


// sendFile will go here
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '/index.html'));
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
        buffer += data;
        // console.log(buffer);
        // isolate a valid json
        var json = buffer.match(/^\{.*\}/);
        if(json && json.length > 0) {
            var now = Date.now();
            // print the rate of data without skipping lines
            // console.log("rate is: "+ (now - last_timestamp)+"ms\r");
            io.emit('rate', now - last_timestamp);
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