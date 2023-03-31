#!/usr/bin/env node

var net = require('net');
var HOST = '152.228.217.88';
var PORT = 8080;

// the usual
const express = require('express');
const path = require('path');
const app = express();

// socket io
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const { Console } = require('console');

const parse = require('node-html-parser').parse;
const io = new Server(server);

// data buffer
var buffer = ""
// time stamp to evaluate rate of data
var last_timestamp = 0;

// fils system
const fs = require('fs');

const { urlToHttpOptions } = require('url');

var databuffer = "";

// databackup timer 60s
// const newFile = setInterval(function() {
//     if(databuffer.length > 0){
//         var title = __dirname+"/DATA/"+ new Date().toISOString().replace(".","") +".csv";
//         title=title.replace(/:/g,"_");
//         fs.appendFile(title,databuffer,function (err,data) {
//             if (err) {
//               return console.log(err);
//             }
//             console.log("DATA SAVED SUCESSFULLY !!");
//           });
//         databuffer="";
//     }
//   }, 50 * 1000);

//   app.get('', function(req, res) {
//     res.sendFile(path.join(__dirname, '/index.html'));
// });

// databackup timer 60s
/*
const interval = setInterval(function() {
    // if last message received is over 30s old
    if( ((Date.now() - last_timestamp) >30000) && (databuffer.length>0)){

        var title = __dirname+"/DATA/"+ new Date().toISOString().replace(".","") +".csv";
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

  app.get('', function(req, res) {
    res.sendFile(path.join(__dirname, '/index.html'));
});
*/

app.get('/lines', function (req, res) {
    res.sendFile(path.join(__dirname, '/lines.html'));
});

app.get('/status', function (req, res) {
    res.sendFile(path.join(__dirname, '/status.html'));
});

app.get('/driver', function (req, res) {
    res.sendFile(path.join(__dirname, '/driver.html'));
});

app.get('/download', function (req, res) {

    function startRecord() {
        console.log("start");
        record = true;
    }

    function stopRecord() {
        console.log("stop");
        record = false;
    }

    // find all files in the directory
    console.log(fs.thehtml);
    var files = fs.readdirSync('./data');
    var thehtml = fs.readFileSync('./download.html', 'utf8');
    const root = parse(thehtml);
    const body = root.querySelector('body');
    // for every file create a button
    for (var i = files.length; i > 0; i--) {
        var file = files[i - 1];    // To show the files in a descending way
        // create a button
        var button = parse('<div class="grid"><a href="./data/' + file + '" download="./data/' + file + '"><button class="customButton">' + file + '</button></a><button class="customButton" style="background-color:red" id="view' + file + '">View graphic</button></div>');
        // console.log(button);
        // add the button to the body
        body.appendChild(button);
    }
    // res.sendFile(path.join(__dirname, '/download.html'));
    res.send(root.toString());
});

app.post('/start', function (req, res) {
    global.record = true;
    // Define the directory where the data files will be saved
    const dataDir = './data';
    // Define the base file name as the date of the day
    const baseFileName = new Date().toISOString().slice(0, 10);
    // Get the list of existing files in the directory that match the base file name
    const existingFiles = fs.readdirSync(dataDir).filter(fileName => fileName.startsWith(baseFileName));
    // Determine the suffix for the new file by incrementing the highest existing suffix
    const suffix = existingFiles.length > 0 ? Math.max(...existingFiles.map(fileName => parseInt(fileName.split('_')[1]))) + 1 : 0;
    // Define the new file name as "baseFileName_suffix.dat" => global file to be accessed when we need to add data in the file
    global.newFileName = `${baseFileName}_${suffix}.dat`;
    // Create the new file using fs.createWriteStream()
    fs.createWriteStream(path.join(dataDir, global.newFileName)).end();
    res.sendStatus(200);
});

app.post('/stop', function (req, res) {
    global.record = false;
    res.sendStatus(200);
});

app.get('/statusrecord', function (req, res) {
    res.json({ record: global.record });
});

// app.post('/data', function (request, response) {
//     var myJson = request.body;      // your JSON
//     console.log(myJson);
//     var file = myJson["file"]	// a value from your JSON
//     console.log(file);
//     // response.send(myJson);	 // echo the result back
// });

// send the file to the client
// app.get('/DATA/:file', function(req, res) {
//     console.log("GETTING FILE: "+req.params.file);
//     var file = req.params.file;
//     res.sendFile(path.join(__dirname, '/DATA/'+file));
// }
// );

// handle static assets
app.use(express.static(__dirname));



// connect socket
io.on('connection', function (socket) {
    console.log('a user connected');
});

// we start the server last so that we can use the socket
server.listen(9999, () => {
    global.record = false;
    console.log('Server started at http://152.228.217.88:' + 9999);
})

net.createServer(function (sock) {
    console.log('CONNECTED DATA:', sock.remoteAddress, ':', sock.remotePort);
    last_timestamp = Date.now();
    sock.setEncoding("utf8"); //set data encoding (either 'ascii', 'utf8', or 'base64')
    sock.on('data', function (data) {
        // DATA RECORDING IF RECORD VARIABLE IS TRUE
        if (global.record) {
            fs.appendFile(`./data/${global.newFileName}`, data + ",\n", (err) => {
                if (err) throw err;
            });
        }
        // console.log(data);
        buffer += data; // for packet reconstitution
        // console.log(buffer);
        // isolate a valid json
        var json = buffer.match(/\{.*\}/);
        // var json = buffer.match(/\{*\}/);
        if (buffer.length > 200) {
            console.log("buffer is : " + buffer);
        }
        if (json && json.length > 0) {
            var now = Date.now();
            // add the data to databuffer in csv format

            // json = json.replace(/\n/g,"").replace(/\r/g,"");
            // console.log("json is: "+json);

            databuffer += json + "\n,"
            // print the rate of data without skipping lines
            // console.log("rate is: "+ (now - last_timestamp)+"ms\r");
            buffer = "";
            // console.log(json);
            try {

                // console.log(json)
                const parsed_data = JSON.parse(json)

                parsed_data["time"] = now;
                last_timestamp = now;
                // console.log(parsed_data)
                // check if a socketio is open
                io.emit('data', parsed_data);
            } catch (err) {
                console.error(err)
            }
        }
    });

}).listen(PORT, HOST, function () {
    console.log("server accepting connections from device");
});
