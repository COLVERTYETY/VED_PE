
import socket 
import time

# create tcp socket
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.settimeout(5) # for 5 sec
sock.connect(('217.160.70.219', 8080)) # '217.160.70.219'


for _ in range(10):
    #sleep for 1 s
    # time.sleep(1)
    #send hello world

    sock.send(b'Hello World')

sock.close()