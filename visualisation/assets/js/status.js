
var socket = io();

var chartBat= new Chart(document.getElementById("chartBat"), {
    type: 'bar',
    data: {
        labels: ["BAT %"],
        datasets: [{
            label: "BAT %",
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            data: [0],
            fill: true,
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        title: {
            display: true,
            text: 'BAT %'
        },
        scales: {
            y: {
                max: 100,
                min: 0,
                ticks: {
                    stepSize: 10
                }
            }
        }
    }
});


function TempColor(T){
    const tmin = 20;
    const tmax = 100;
    const normed = log((T-tmin)/(tmax-tmin))+1;
    if (normed<0){
        return ['rgba(0, 135, 255, 0.1)','rgba(0, 135, 255, 1)'];
    }
    if(T>tmax){
        return ['rgba(255, 135, 0, 0.1)','rgba(255, 135, 0, 1)'];
    }
    const r = normed*255;
    const b = (1-normed)*255;
    return ['rgba('+r+', 135,'+b+', 0.3)','rgba('+r+', 135,'+b+', 0.3)'];
}

var chartTemp= new Chart(document.getElementById("chartTemp"), {
    type: 'bar',
    data: {
        labels: ["Moteur","Batterie","Mosfet"],
        datasets: [{
            label: "Moteur",
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            data: [0],
            fill: true,
        },{
            label: "Batterie",
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            data: [0],
            fill: true,
        },{
            label: "Mosfet",
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            data: [0],
            fill: true,
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        title: {
            display: true,
            text: 'temperatures (°C)'
        },
        scales: {
            y: {
                max: 100,
                min: 0,
                ticks: {
                    stepSize: 10
                }
            }
        }
    }
});

// calc bat %
var Vmax=50;
var Vmin=47;

// calc rate
var last_timestamp=0;
var freq=0;

socket.on('connection', function() {
    console.log('connected');
});

socket.on("data", function(data) {
    freq = 1/((Date.now() - last_timestamp)/1000) // en Hz
    if(Date.now()-data["time"]  > 500) {
        // console.log("data too old");
        return;
    }
    else {
        // update bat indicator
        var bat_val = 100.0*(data["U"]-Vmin)/(Vmax-Vmin);
        chartBat.data.datasets[0].data[0]=bat_val;
        chartBat.data.labels[0]=data["U"]+" V";
        chartBat.data.datasets[0].backgroundColor= 'rgba(' +(255*(1-(bat_val/100)))+','+(255*(bat_val/100)) +'132, 0.2)';
        chartBat.data.datasets[0].borderColor=     'rgba(' +(255*(1-(bat_val/100)))+','+(255*(bat_val/100)) +'132, 1)';
        chartBat.update();

        //update rate

        //update temps
        chartTemp.data.datasets[0].data[0]=data("M");
    }
});