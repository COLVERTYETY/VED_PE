// Set the path where CSV files will be stored
//const filePath = '../data/';

//const myfilename = filePath + getFilename();

//fs.writeFile(myfilename, "");

var socket = io();

socket.on('connection', function () {
    console.log('connected');
});

socket.on("data", function (data) {
    document.getElementById('vitesse').textContent = Math.trunc((Math.PI * 0.508 * 60 * data["V"])/1000);
    document.getElementById('rpm').textContent = Math.trunc(data["R"]);

    var max_puissance = 200;
    var max_temp = 80;

    document.getElementById('pourcentage').textContent = '100%'; // Math.trunc(100.0*(data["U"]- 38.4)/10) + '%';

    document.getElementById('puissance').textContent = data["P"];
    document.getElementById('aff_puissance').style.width = data["P"] * (100/max_puissance) + '%';

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

    // const newdata = {
    //     date: '2023-03-10',
    //     time: '10:30:00',
    //     vitesse: Math.trunc((Math.PI * 0.508 * 60 * data["V"])/1000),
    //     rpm: Math.trunc(data["R"]),
    //     pourcentage: '100%',
    //     puissance: data["P"],
    //     temp_moteur: data["M"],
    //     temp_batterie: data["B"],
    //     temp_mosfet: data["O"]
    // };

    //fs.appendFile(myfilename, newdata);
    
});

//function getFilename() {
//   const now = new Date();
//   const timestamp = `${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;
//   return `${filePath}${timestamp}.csv`;
// }

// Color changing in function of the values (by steps of 25%)
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