#!/usr/bin/env node
var net = require('net');
var HOST = '0.0.0.0';
var PORT = 8080;

var Chart = require('chart.js');

const express = require('express');
const path = require('path');
const app = express();
// const port = process.env.PORT || 8080;

// sendFile will go here
app.get('/graph', function(req, res) {
    // get the canvas

    // res.sendFile(path.join(__dirname, '/index.html'));
});
app.listen(9999);
console.log('Server started at http://localhost:' + 9999);


// params 

maxsize = 100;

// arrays to hold the data
var Tmoteur = []
var Tbatterie = []
var Tmosfet = []

var Courant = []

var vitesse = []
var rpm = []

var Vbatterie = []
var Vmoteur = []

var puissance = []
var consigne = []
var dutycycle = [] 

net.createServer(function(sock) {
    console.log('CONNECTED:',sock.remoteAddress,':',sock.remotePort);
    sock.setEncoding("utf8"); //set data encoding (either 'ascii', 'utf8', or 'base64')
    sock.on('data', function(data) {
        // console.log(data);
        try {
            const parsed_data = JSON.parse(data)
            console.log(parsed_data)
            // check if "A" is a key in the parsed data
            if ("A" in parsed_data) {
                // add teh value to the array
                Courant.push(parseFloat(parsed_data["A"]))
            }
            if ("M" in parsed_data) {
                Tmoteur.push(parseFloat(parsed_data["M"]))
            }
            if ("B" in parsed_data) {
                Tbatterie.push(parseFloat(parsed_data["B"]))
            }
            if ("0" in parsed_data) {
                Tmosfet.push(parseFloat(parsed_data["0"]))
            }
            if ("U" in parsed_data) {
                Vbatterie.push(parseFloat(parsed_data["U"]))
            }
            if ("T" in parsed_data) {
                Vmoteur.push(parseFloat(parsed_data["T"]))
            }
            if ("R" in parsed_data) {
                rpm.push(parseFloat(parsed_data["R"]))
            }
            if ("V" in parsed_data) {
                vitesse.push(parseFloat(parsed_data["V"]))
            }
            if ("D" in parsed_data) {
                dutycycle.push(parseFloat(parsed_data["D"]))
            }
            if ("P" in parsed_data) {
                puissance.push(parseFloat(parsed_data["P"]))
            }
            if ("C" in parsed_data) {
                consigne.push(parseFloat(parsed_data["C"]))
            }
          } catch(err) {
            console.error(err)
          }
          // check if data is too long
            if (Tmoteur.length > maxsize) {
                // remove the first element
                Tmoteur.shift()
            }
            if (Tbatterie.length > maxsize) {
                // remove the first element
                Tbatterie.shift()
            }
            if (Tmosfet.length > maxsize) {
                // remove the first element
                Tmosfet.shift()
            }
            if (Courant.length > maxsize) {
                // remove the first element
                Courant.shift()
            }
            if (Vbatterie.length > maxsize) {
                // remove the first element
                Vbatterie.shift()
            }
            if (Vmoteur.length > maxsize) {
                // remove the first element
                Vmoteur.shift()
            }
            if (rpm.length > maxsize) {
                // remove the first element
                rpm.shift()
            }
            if (vitesse.length > maxsize) {
                // remove the first element
                vitesse.shift()
            }
            if (dutycycle.length > maxsize) {
                // remove the first element
                dutycycle.shift()
            }
            if (puissance.length > maxsize) {
                // remove the first element
                puissance.shift()
            }
            if (consigne.length > maxsize) {
                // remove the first element
                consigne.shift()
            }

    });

}).listen(PORT, HOST, function() {
    console.log("server accepting connections");
});