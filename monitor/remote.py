import socket

# Create a TCP/IP socket
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

# print all data received on the socket
sock.connect(('127.0.0.1', 8080))

# print all data received on the socket
while True:
    data = sock.recv(1024)
    if not data:
        break
    print(data.decode('utf-8'))

sock.close()