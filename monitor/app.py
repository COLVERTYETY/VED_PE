import serial
import matplotlib.pyplot as plt
import numpy as np

done = False

def close_figure(event):
    global done
    if event.key == 'escape':
        plt.close(event.canvas.figure)
        done = True

plt.ion() # interactive mode on
fig = plt.figure()
plt.gcf().canvas.mpl_connect('key_press_event', close_figure)


# read the data from the serial port
serialPort = serial.Serial(port = "/dev/ttyUSB0", baudrate=115200, bytesize=8, timeout=2, stopbits=serial.STOPBITS_ONE)

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


while(not done):

    
    # Wait until there is data waiting in the serial buffer
    if(serialPort.in_waiting > 0):
        trick+=1
        # Read data out of the buffer until a carraige return / new line is found
        serialString = serialPort.readline()
        # print(serialString)
        try:
            # Print the contents of the serial data
            raw = serialString.decode('utf-8')

            data = raw.split("/")
            for i in data:
                d = i.split(":")
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

            
            if trick >20:
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




