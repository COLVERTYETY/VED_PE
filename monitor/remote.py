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
sock.listen(5)
try:
    while True:
        print("start")
        conn, addr = sock.accept()
        print('Connected by', addr)
        while True:
            data = conn.recv(1024)
            if not data:
                break
            try:
                trick +=1
                # Print the contents of the serial data
                raw = data.decode('utf-8')

                data = raw.split("/")
                for i in data:
                    d = i.split(":")
                    if d and len(d)>0 and  d[0] in "AMBOUTRVDCP":
                        match d[0]:
                            case "A":
                                Courant.append(float(d[1]))
                            case "M":
                                Tmoteur.append(float(d[1]))
                            case "B":
                                Tbatterie.append(float(d[1]))
                            case "O":
                                Tmosfet.append(float(d[1]))
                            case "U":
                                Vbatterie.append(float(d[1]))
                            case "T":
                                Vmoteur.append(float(d[1]))
                            case "R":
                                rpm.append(float(d[1]))
                                # print(rpm[-1])
                            case "V":
                                vitesse.append(float(d[1]))
                            case "D":
                                dutycycle.append(float(d[1]))
                            case "C":
                                consigne.append(float(d[1]))
                            case "P":
                                puissance.append(float(d[1]))
                if len(Tmoteur) > datasize:
                    Tmoteur.pop(0)
                if len(Tbatterie)>datasize:
                    Tbatterie.pop(0)
                if len(Tmosfet)>datasize:
                    Tmosfet.pop(0)
                if len(Courant)>datasize:
                    Courant.pop(0)
                if len(Vbatterie)>datasize:
                    Vbatterie.pop(0)
                if len(Vmoteur)>datasize:
                    Vmoteur.pop(0)
                if len(rpm)>datasize:
                    rpm.pop(0)
                if len(vitesse)>datasize:
                    vitesse.pop(0)
                if len(dutycycle)>datasize:
                    dutycycle.pop(0)
                if len(consigne)>datasize:
                    consigne.pop(0)
                if len(puissance)>datasize:
                    puissance.pop(0)

                
                if trick >10:
                    trick = 0
                    # Clear the current figure
                    plt.clf()
                    # Plot the data
                    plt.subplot(3,2,1)
                    plt.plot(Tmoteur, 'r')
                    plt.plot(Tbatterie, 'b')
                    plt.plot(Tmosfet, 'g')
                    plt.ylabel('Temperature (°C)')
                    plt.xlabel('Time (s)')
                    plt.title('Temperature')
                    plt.legend(['Moteur', 'Batterie', 'Mosfet'])
                    plt.grid(True)

                    plt.subplot(3,2,2)
                    plt.plot(Courant, 'r')
                    plt.ylabel('Courant (A)')
                    plt.xlabel('Time (s)')
                    plt.title('Courant')
                    plt.grid(True)

                    plt.subplot(3,2,3)
                    plt.plot(Vbatterie, 'r')
                    plt.plot(Vmoteur, 'b')
                    plt.ylabel('Voltage (V)')
                    plt.xlabel('Time (s)')
                    plt.title('Voltage')
                    plt.legend(['Batterie', 'Moteur'])
                    plt.grid(True)

                    plt.subplot(3,2,4)
                    plt.plot(rpm, 'r')
                    plt.plot(vitesse, 'b')
                    plt.ylabel('RPM')
                    plt.xlabel('Time (s)')
                    plt.title('RPM')
                    plt.legend(['RPM', 'Vitesse'])
                    plt.grid(True)

                    plt.subplot(3,2,5)
                    plt.plot(consigne, 'r')
                    plt.plot(puissance, 'b')
                    plt.plot(np.array(consigne)*np.array(dutycycle)/255, 'g')
                    plt.ylabel('Consigne')
                    plt.xlabel('Time (s)')
                    plt.title('Consigne')
                    plt.legend(['Consigne', 'Puissance', 'DutyCycle'])
                    plt.grid(True)

                    plt.draw()
                    plt.pause(0.001)
            except ValueError:
                print("ValueError")

except KeyboardInterrupt:
    print("KeyboardInterrupt")
    sock.close()