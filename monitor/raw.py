
from socket import *
# Port number of server
server_port = 8080
# Server using IPv4 and tcp socket
with socket(AF_INET, SOCK_STREAM) as server_socket:
    # Bind the socket to the port
    server_socket.bind(('', server_port))
    # Listen for incoming connections
    server_socket.listen(1)

    while True:
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
                print(data)
        