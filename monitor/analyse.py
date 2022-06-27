import numpy as np
import matplotlib.pyplot as plt
import sys
import json
import os
import glob

# get the file name from the args
if len(sys.argv) < 2 or len(sys.argv) > 3:
    print("Usage: python3 analyse.py <file>")
    print("choosing latest")
    list_of_files = glob.glob('../visualisation/DATA/*') # * means all if need specific format then *.csv
    filename = max(list_of_files, key=os.path.getctime)
else:
    filename = sys.argv[1]

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
potard = []

with open(filename) as f:
    data = f.read()
    # for each line in the file add the data to the list
    for line in data.splitlines():
        # print(line)
        # try to parse the line as json
        try:
            # parse the line as json
            json_data = json.loads(line)
            # add the data to the list
            Tmoteur.append(json_data["M"])
            Tbatterie.append(json_data["B"])
            Tmosfet.append(json_data["O"])
            Courant.append(json_data["A"])
            vitesse.append(json_data["V"])
            rpm.append(json_data["R"])
            Vbatterie.append(json_data["U"])
            Vmoteur.append(json_data["T"])
            puissance.append(json_data["P"])
            consigne.append(json_data["C"])
            dutycycle.append(json_data["D"])
            potard.append(json_data["L"])
        except:
            # if the line is not json, ignore it
            pass


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
plt.ylabel('Consigne')
plt.xlabel('Time (s)')
plt.title('Consigne')
plt.legend(['Consigne', 'Puissance'])
plt.grid(True)

plt.subplot(3,2,6)
plt.plot(dutycycle, 'r')
plt.plot(potard, 'b')
plt.ylabel('Duty Cycle')
plt.xlabel('Time (s)')
plt.title('Duty Cycle')
plt.legend(['Duty Cycle', 'Potard'])
plt.grid(True)

plt.show()