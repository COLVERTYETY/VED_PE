from socket import *
import matplotlib.pyplot as plt
import numpy as np
import time

# Port number of server
server_port = 8080

done = False

def close_figure(event):
    global done
    if event.key == 'escape':
        plt.close(event.canvas.figure)
        done = True

plt.ion() # interactive mode on
fig = plt.figure()
plt.gcf().canvas.mpl_connect('key_press_event', close_figure)

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

maxtrick = 20
trick = 10

# Server using IPv4 and tcp socket
with socket(AF_INET, SOCK_STREAM) as server_socket:
    # Bind the socket to the port
    server_socket.bind(('', server_port))
    # Listen for incoming connections
    server_socket.listen(1)

    while (not done):
        # Accept a connection
        connection, address = server_socket.accept()
        print('Accepted connection from', address)
        
        # while connection is open
        while True:
            # Receive data
            data = connection.recv(1024)
            # if not data:
            #     break
            # Convert data to uppercase
            if data:
                data = data.decode('utf-8')
                # print(data)
                sections = data.split('/')
                for s in sections:
                    if ":" in s:
                        vals = s.split(':')
                        vals[1] = float(''.join(c for c in x if (c.isdigit() or c =='.')))
                        if vals[0] == "A":
                            Courant.append(vals[1])
                        elif vals[0] == "M":
                            Tmoteur.append(vals[1])
                        elif vals[0] == "B":
                            Tbatterie.append(vals[1])
                        elif vals[0] == "O":
                            Tmosfet.append(vals[1])
                        elif vals[0] == "U":
                            Vbatterie.append(vals[1])
                        elif vals[0] == "T":
                            Vmoteur.append(vals[1])
                        elif vals[0] == "R":
                            rpm.append(vals[1])
                        elif vals[0] == "V":
                            vitesse.append(vals[1])
                        elif vals[0] == "D":
                            dutycycle.append(vals[1])
                        elif vals[0] == "C":
                            consigne.append(vals[1])
                        elif vals[0] == "P":
                            puissance.append(vals[1])
                if len(Tmoteur) > datasize:
                    Tmoteur.pop(0)
                if len(Tbatterie) > datasize:
                    Tbatterie.pop(0)
                if len(Tmosfet) > datasize:
                    Tmosfet.pop(0)
                if len(Courant) > datasize:
                    Courant.pop(0)
                if len(rpm) > datasize:
                    rpm.pop(0)
                if len(vitesse) > datasize:
                    vitesse.pop(0)
                if len(dutycycle) > datasize:
                    dutycycle.pop(0)
                if len(consigne) > datasize:
                    consigne.pop(0)
                if len(puissance) > datasize:
                    puissance.pop(0)
                if len(Vbatterie) > datasize:
                    Vbatterie.pop(0)
                if len(Vmoteur) > datasize:
                    Vmoteur.pop(0)
                
                if trick> maxtrick:
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

                

                            

        