import socket
import matplotlib.pyplot as plt
import numpy as np


datasize = 300

Tmoteur = []
Tbatterie = []
Tmosfet = []

Courant = []

vitesse = []
rpm = []

Vbatterie = []
Vmoteur = []

puissance = []
consigne = []
dutycycle = [] 


trick = 10


# # Create a TCP/IP socket
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

# # print all data received on the socket
sock.bind(("0.0.0.0", 8080))
sock.listen(50)
# try:
while True:
    print("start")
    conn, addr = sock.accept()
    print('Connected by', addr)
    while True:
        data = conn.recv(1024)
        if not data:
            break
        trick +=1
        # Print the contents of the serial data
        raw = data.decode('utf-8')
        print(raw)

# except Exception as e:
#     print("KeyboardInterrupt", e)
#     sock.close()