
var socket = io();

maxsize = 200;

var chartCourant = new Chart(document.getElementById("chartCourant"), {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: "Courant",
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            data: [],
            fill: true,
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        title: {
            display: true,
            text: 'Courant'
        }
    }
});

var chartVoltage = new Chart(document.getElementById("chartVoltage"), {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: "batterie",
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            data: [],
            fill: false,
        }
        ,{
            label: "moteur",
            backgroundColor: 'rgba(100, 99, 255, 0.2)',
            borderColor: 'rgba(100, 99, 255, 1)',
            data: [],
            fill: false,
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        title: {
            display: true,
            text: 'Tension'
        }
    }
});

var chartVitesse = new Chart(document.getElementById("chartVitesse"), {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: "backEMF",
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            data: [],
            fill: false,
        }
        ,{
            label: "HALL",
            backgroundColor: 'rgba(100, 99, 255, 0.2)',
            borderColor: 'rgba(100, 99, 255, 1)',
            data: [],
            fill: false,
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        title: {
            display: true,
            text: 'Vitesse'
        }
    }
});

var chartTemp = new Chart(document.getElementById("chartTemp"), {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: "Moteur",
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            data: [],
            fill: false,
        },
        {
            label: "Batterie",
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            data: [],
            fill: false,
        },
        {
            label: "Mosfet",
            
            backgroundColor: 'rgba(255, 206, 86, 0.2)',
            borderColor: 'rgba(255, 206, 86, 1)',
            data: [],
            fill: false,
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        title: {
            display: true,
            text: 'Temperature'
        }
    }
});

var chartPower= new Chart(document.getElementById("chartPower"), {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: "consigne",
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            data: [],
            fill: false,
        },
        {
            label: "Puissance",
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            data: [],
            fill: false,
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        title: {
            display: true,
            text: 'Temperature'
        }
    }
});

var chartInput= new Chart(document.getElementById("chartInput"), {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: "dutyCycle",
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            data: [],
            fill: false,
        },
        {
            label: "pot",
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            data: [],
            fill: false,
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        title: {
            display: true,
            text: 'Temperature'
        }
    }
});

socket.on('connection', function() {
    console.log('connected');
});

socket.on('A', function(data) {
    // create array of indexes for the labels
    var indexes = [];
    for (var i = 0; i < chartCourant.data.datasets[0].data.length; i++) {
        indexes.push(i);
    }
    chartCourant.data.labels=indexes;
    // chartCourant.update('none');
    chartCourant.data.datasets[0].data.push(data);
    if(chartCourant.data.datasets[0].data.length > maxsize) {
        chartCourant.data.datasets[0].data.shift();
    }
    chartCourant.update('none');
});

socket.on('M', function(data) {
    // create array of indexes for the labels
    var indexes = [];
    for (var i = 0; i < chartTemp.data.datasets[0].data.length; i++) {
        indexes.push(i);
    }
    chartTemp.data.labels=indexes;
    // chartCourant.update('none');
    chartTemp.data.datasets[0].data.push(data);
    if(chartTemp.data.datasets[0].data.length > maxsize) {
        chartTemp.data.datasets[0].data.shift();
    }
    chartTemp.update('none');
});

socket.on('B', function(data) {
    // create array of indexes for the labels
    var indexes = [];
    for (var i = 0; i < chartTemp.data.datasets[1].data.length; i++) {
        indexes.push(i);
    }
    chartTemp.data.labels=indexes;
    // chartCourant.update('none');
    chartTemp.data.datasets[1].data.push(data);
    if(chartTemp.data.datasets[1].data.length > maxsize) {
        chartTemp.data.datasets[1].data.shift();
    }
    chartTemp.update('none');
});

socket.on('O', function(data) {
    // create array of indexes for the labels
    var indexes = [];
    for (var i = 0; i < chartTemp.data.datasets[2].data.length; i++) {
        indexes.push(i);
    }
    chartTemp.data.labels=indexes;
    // chartCourant.update('none');
    chartTemp.data.datasets[2].data.push(data);
    if(chartTemp.data.datasets[2].data.length > maxsize) {
        chartTemp.data.datasets[2].data.shift();
    }
    chartTemp.update('none');
});

socket.on('U', function(data) {
    // create array of indexes for the labels
    var indexes = [];
    for (var i = 0; i < chartVoltage.data.datasets[0].data.length; i++) {
        indexes.push(i);
    }
    chartVoltage.data.labels=indexes;
    // chartCourant.update('none');
    chartVoltage.data.datasets[0].data.push(data);
    if(chartVoltage.data.datasets[0].data.length > maxsize) {
        chartVoltage.data.datasets[0].data.shift();
    }
    chartVoltage.update('none');
});

socket.on('T', function(data) {
    // create array of indexes for the labels
    var indexes = [];
    for (var i = 0; i < chartVoltage.data.datasets[1].data.length; i++) {
        indexes.push(i);
    }
    chartVoltage.data.labels=indexes;
    // chartCourant.update('none');
    chartVoltage.data.datasets[1].data.push(data);
    if(chartVoltage.data.datasets[1].data.length > maxsize) {
        chartVoltage.data.datasets[1].data.shift();
    }
    chartVoltage.update('none');
});

socket.on('R', function(data) {
    // create array of indexes for the labels
    var indexes = [];
    for (var i = 0; i < chartVitesse.data.datasets[0].data.length; i++) {
        indexes.push(i);
    }
    chartVitesse.data.labels=indexes;
    // chartCourant.update('none');
    chartVitesse.data.datasets[0].data.push(data);
    if(chartVitesse.data.datasets[0].data.length > maxsize) {
        chartVitesse.data.datasets[0].data.shift();
    }
    chartVitesse.update('none');
});


socket.on('V', function(data) {
    // create array of indexes for the labels
    var indexes = [];
    for (var i = 0; i < chartVitesse.data.datasets[1].data.length; i++) {
        indexes.push(i);
    }
    chartVitesse.data.labels=indexes;
    // chartCourant.update('none');
    chartVitesse.data.datasets[1].data.push(data);
    if(chartVitesse.data.datasets[1].data.length > maxsize) {
        chartVitesse.data.datasets[1].data.shift();
    }
    chartVitesse.update('none');
});

socket.on('D', function(data) {
    // create array of indexes for the labels
    var indexes = [];
    for (var i = 0; i < chartInput.data.datasets[0].data.length; i++) {
        indexes.push(i);
    }
    chartInput.data.labels=indexes;
    // chartCourant.update('none');
    chartInput.data.datasets[0].data.push(data);
    if(chartInput.data.datasets[0].data.length > maxsize) {
        chartInput.data.datasets[0].data.shift();
    }
    chartInput.update('none');
});

socket.on('L', function(data) {
    // create array of indexes for the labels
    var indexes = [];
    for (var i = 0; i < chartInput.data.datasets[1].data.length; i++) {
        indexes.push(i);
    }
    chartInput.data.labels=indexes;
    // chartCourant.update('none');
    chartInput.data.datasets[1].data.push(data);
    if(chartInput.data.datasets[1].data.length > maxsize) {
        chartInput.data.datasets[1].data.shift();
    }
    chartInput.update('none');
});

socket.on('P', function(data) {
    // create array of indexes for the labels
    var indexes = [];
    for (var i = 0; i < chartPower.data.datasets[1].data.length; i++) {
        indexes.push(i);
    }
    chartPower.data.labels=indexes;
    // chartCourant.update('none');
    chartPower.data.datasets[1].data.push(data);
    if(chartPower.data.datasets[1].data.length > maxsize) {
        chartPower.data.datasets[1].data.shift();
    }
    chartPower.update('none');
});

socket.on('C', function(data) {
    // create array of indexes for the labels
    var indexes = [];
    for (var i = 0; i < chartPower.data.datasets[0].data.length; i++) {
        indexes.push(i);
    }
    chartPower.data.labels=indexes;
    // chartCourant.update('none');
    chartPower.data.datasets[0].data.push(data);
    if(chartPower.data.datasets[0].data.length > maxsize) {
        chartPower.data.datasets[0].data.shift();
    }
    chartPower.update('none');
});