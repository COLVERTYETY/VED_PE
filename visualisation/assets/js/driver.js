
var socket = io();

socket.on('connection', function () {
    console.log('connected');
});

socket.on("data", function (data) {
    document.getElementById('vitesse').textContent = data["R"];

    document.getElementById('puissance').textContent = data["P"];;
    document.getElementById('aff_puissance').style.height = data["P"] * 0.75 + 'vh';

    document.getElementById('temp_moteur').textContent = data["M"];;
    document.getElementById('aff_moteur').style.height = data["M"] * 0.5 + 'vh';

    document.getElementById('temp_batterie').textContent = data["B"];;
    document.getElementById('aff_batterie').style.height = data["B"] * 0.5 + 'vh';

    document.getElementById('temp_mosfet').textContent = data["O"];;
    document.getElementById('aff_mosfet').style.height = data["O"] * 0.5 + 'vh';

    document.getElementById('aff_moteur').style.backgroundColor = changeColor(data["M"]);
    document.getElementById('aff_batterie').style.backgroundColor = changeColor(data["B"]);
    document.getElementById('aff_mosfet').style.backgroundColor = changeColor(data["O"]);
    document.getElementById('aff_puissance').style.backgroundColor = changeColor(data["P"]);
});


function changeColor(data) {
    var color = "green";
    switch(true) {
        case(data < 25):
            color = "green";
            break;
        case(data < 35):
            color = "blue";
            break;
        case(data < 45):
            color = "darkorange";
            break;
        default:
            color = "red";
            break;
    }
    return color
};