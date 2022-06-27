
import socket 
import time
import random

# create tcp socket
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.settimeout(5) # for 5 sec
# sock.connect(('217.160.70.219', 8080)) # '217.160.70.219'
sock.connect(('0.0.0.0', 8080))
# check if connection succes
print("connected")

while True:
    #sleep for 1 s
    time.sleep(0.2)
    #send hello world
    # create jsondata with random data
    jsondata = '{"A":' + str(random.randint(0,100)) + ',"M":' + str(random.randint(0,100)) + ',"B":' + str(random.randint(0,100)) + ',"O":' + str(random.randint(0,100)) + ',"U":' + str(random.randint(0,100)) + ',"T":' + str(random.randint(0,100)) + ',"R":' + str(random.randint(0,100)) + ',"V":' + str(random.randint(0,100)) + ',"D":' + str(random.randint(0,100)) + ',"C":' + str(random.randint(0,100)) + ',"P":' + str(random.randint(0,100)) + '}'
    print(jsondata)
    sock.send(jsondata.encode())

sock.close()