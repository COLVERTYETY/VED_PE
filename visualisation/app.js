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
const io = new Server(server);

// data buffer

var buffer = ""

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
    sock.setEncoding("utf8"); //set data encoding (either 'ascii', 'utf8', or 'base64')
    sock.on('data', function(data) {
        // console.log(data);
        buffer += data;
        console.log(buffer);
        // isolate a valid json
        var json = buffer.match(/^\{.*\}/);
        if(json && json.length > 0) {
            buffer = "";
            console.log(json);
            try {
                const parsed_data = JSON.parse(json[0])
                // console.log(parsed_data)
                // check if a socketio is open
                    if ("A" in parsed_data) {
                        //send the value to all clients
                        io.emit('A', parseFloat(parsed_data["A"]));
                    }
                    if ("M" in parsed_data) {
                        io.emit('M', parseFloat(parsed_data["M"]));
                    }
                    if ("B" in parsed_data) {
                        io.emit('B', parseFloat(parsed_data["B"]));
                    }
                    if ("O" in parsed_data) {
                        io.emit('O', parseFloat(parsed_data["O"]));
                    }
                    if ("U" in parsed_data) {
                        io.emit('U', parseFloat(parsed_data["U"]));
                    }
                    if ("T" in parsed_data) {
                        io.emit('T', parseFloat(parsed_data["T"]));
                    }
                    if ("R" in parsed_data) {
                        io.emit('R', parseFloat(parsed_data["R"]));
                    }
                    if ("V" in parsed_data) {
                        io.emit('V', parseFloat(parsed_data["V"]));
                    }
                    if ("D" in parsed_data) {
                        io.emit('D', parseFloat(parsed_data["D"]));
                    }
                    if ("P" in parsed_data) {
                        io.emit('P', parseFloat(parsed_data["P"]));
                    }
                    if ("C" in parsed_data) {
                        io.emit('C', parseFloat(parsed_data["C"]));
                    }
            } catch(err) {
                console.error(err)
                }
            }
    });

}).listen(PORT, HOST, function() {
    console.log("server accepting connections from device");
});