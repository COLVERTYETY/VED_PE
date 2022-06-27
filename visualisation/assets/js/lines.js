
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

// handle closing of the socket
socket.on('disconnect', function() {
    console.log('disconnected');
});

socket.on("data", function(data) {
    if(Date.now()-data["time"]  > 500) {
        // console.log("data too old");
        return;
    }
    else {
        // console.log(data["time"]-Date.now());
        chartCourant.data.labels.push(data["time"]);
        chartCourant.data.datasets[0].data.push(data["A"]);
        
        chartVoltage.data.labels.push(data["time"]);
        chartVoltage.data.datasets[0].data.push(data["U"]);
        chartVoltage.data.datasets[1].data.push(data["T"]);
        
        chartVitesse.data.labels.push(data["time"]);
        chartVitesse.data.datasets[0].data.push(data["R"]);
        chartVitesse.data.datasets[1].data.push(data["V"]);
        
        chartTemp.data.labels.push(data["time"]);
        chartTemp.data.datasets[0].data.push(data["M"]);
        chartTemp.data.datasets[1].data.push(data["B"]);
        chartTemp.data.datasets[2].data.push(data["0"]);
        
        chartPower.data.labels.push(data["time"]);
        chartPower.data.datasets[0].data.push(data["C"]);
        chartPower.data.datasets[1].data.push(data["P"]);
        
        chartInput.data.labels.push(data["time"]);
        chartInput.data.datasets[0].data.push(data["D"]);
        chartInput.data.datasets[1].data.push(data["L"]);
        
        if(chartCourant.data.labels.length > maxsize) {
            chartCourant.data.labels.shift();
            chartCourant.data.datasets[0].data.shift();
            chartVoltage.data.labels.shift();
            chartVoltage.data.datasets[0].data.shift();
            chartVoltage.data.datasets[1].data.shift();
            chartVitesse.data.labels.shift();
            chartVitesse.data.datasets[0].data.shift();
            chartVitesse.data.datasets[1].data.shift();
            chartTemp.data.labels.shift();
            chartTemp.data.datasets[0].data.shift();
            chartTemp.data.datasets[1].data.shift();
            chartTemp.data.datasets[2].data.shift();
            chartPower.data.labels.shift();
            chartPower.data.datasets[0].data.shift();
            chartPower.data.datasets[1].data.shift();
            chartInput.data.labels.shift();
            chartInput.data.datasets[0].data.shift();
            chartInput.data.datasets[1].data.shift();
        }

        chartCourant.update('none');
        chartVoltage.update('none');
        chartVitesse.update('none');
        chartTemp.update('none');
        chartPower.update('none');
        chartInput.update('none');
    }
});