
var socket = io();

socket.on('connection', function () {
    console.log('connected');
});

socket.on("data", function (data) {
    document.getElementById('vitesse').textContent = Math.trunc(data["R"]);

    var max_puissance = 200;
    var max_temp = 80;

    document.getElementById('puissance').textContent = data["P"];;
    document.getElementById('aff_puissance').style.height = data["P"] * (50/max_puissance) + 'vh';

    document.getElementById('temp_moteur').textContent = data["M"];;
    document.getElementById('aff_moteur').style.height = data["M"] * (50/max_temp) + 'vh';

    document.getElementById('temp_batterie').textContent = data["B"];;
    document.getElementById('aff_batterie').style.height = data["B"] * (50/max_temp) + 'vh';

    document.getElementById('temp_mosfet').textContent = data["O"];;
    document.getElementById('aff_mosfet').style.height = data["O"] * (50/max_temp) + 'vh';

    document.getElementById('aff_moteur').style.backgroundColor = changeColor(data["M"], max_temp);
    document.getElementById('aff_batterie').style.backgroundColor = changeColor(data["B"], max_temp);
    document.getElementById('aff_mosfet').style.backgroundColor = changeColor(data["O"], max_temp);
    document.getElementById('aff_puissance').style.backgroundColor = changeColor(data["P"], max_puissance);
});


function changeColor(data, max) {
    var color = "green";
    switch(true) {
        case(data < 0.25 * max):
            color = "green";
            break;
        case(data < 0.5 * max):
            color = "blue";
            break;
        case(data < 0.75 * max):
            color = "darkorange";
            break;
        default:
            color = "red";
            break;
    }
    return color
};