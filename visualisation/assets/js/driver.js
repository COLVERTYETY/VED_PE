
var socket = io();

var vitesse = document.getElementById('vitesse');
var aff_vitesse = document.getElementById('aff_vitesse');

var puissance = document.getElementById('puissance');
var aff_puissance = document.getElementById('aff_puissance');

var temp_moteur = document.getElementById('temp_moteur');
var aff_moteur = document.getElementById('aff_moteur');

var temp_batterie = document.getElementById('temp_batterie');
var aff_batterie = document.getElementById('aff_batterie');

var temp_mosfet = document.getElementById('temp_mosfet');
var aff_mosfet = document.getElementById('aff_mosfet');


socket.on('connection', function () {
    console.log('connected');
});

socket.on('M', function (data) {
    temp_moteur = chartTemp.data.datasets[0][-1];
    changeColor(temp_moteur);
    aff_moteur.style.width = str(temp_moteur * 3.33) + '%';
});

socket.on('B', function (data) {
    temp_batterie = chartTemp.data.datasets[1][-1];
    changeColor(temp_batterie);
    aff_batterie.style.width = str(temp_batterie * 3.33) + '%';
});


function changeColor(data) {
    switch(true) {
        case(data < 15):
            data.style.color = "green";
            break;
        case(data < 25):
            data.style.color = "blue";
            break;
        case(data < 35):
            data.style.color = "orangered";
            break;
        default:
            data.style.color = "white";
            data.style.backgroundColor = "red";
            break;
    }
};