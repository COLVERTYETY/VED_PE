#!/usr/bin/env node

const express = require('express')
const bodyParser = require('body-parser')
const app = express()

// ajout de socket.io
const server = require('http').Server(app)
const io = require('socket.io')(server)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static('public'))
app.get('/', function (req, res) {
   res.sendFile('index.html', { root: __dirname })
})

app.get('/json', function (req, res) {
   res.status(200).json({"message":"ok"})
})

// établissement de la connexion
io.on('connection', (socket) =>{
   console.log(`Connecté au client ${socket.id}`)
})

// display data received on socket
io.on('data', (data) => {
    console.log(data)
})


// on change app par server
server.listen(8080, function () {
 console.log('Votre app est disponible sur localhost:3000 !')
})