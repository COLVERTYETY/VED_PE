
import serial
import socket
import time
import json

# Remplacez par le nom du port série de votre Arduino (ex: '/dev/ttyACM0' sur Linux)
SERIAL_PORT = 'COM5'
BAUD_RATE = 9600
# Remplacez par l'adresse et le port de votre serveur
SERVER_ADDRESS = ('152.228.217.88', 8080)

arduino = serial.Serial(SERIAL_PORT, BAUD_RATE, bytesize=8, timeout=2, stopbits=serial.STOPBITS_ONE)

sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.settimeout(5)  # pour 5 secondes
sock.connect(SERVER_ADDRESS)

print("connecté")

try:
    while True:
        data = arduino.readline().strip().decode(
            'utf-8')  # Lire les données du port série
        if data:
            values = data.split(',')
            json_data = {
                "A": int(values[0]),
                # ... Ajoutez d'autres clés et valeurs pour les autres capteurs
            }
            json_str = json.dumps(json_data)
            print(json_str)
            sock.send(json_str.encode())

        time.sleep(1)
except KeyboardInterrupt:
    arduino.close()
    sock.close()
    print("Terminé")
