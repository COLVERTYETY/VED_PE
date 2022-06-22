"""
UDP echo server that converts a message
received from client into uppercase and
then sends it back to client. 
"""
from socket import *
# Port number of server
server_port = 8080
# Server using IPv4 and UDP socket
server_socket = socket(AF_INET, SOCK_DGRAM)
# Bind server to port number and IP address
server_socket.bind(("0.0.0.0", server_port))
print("The server is ready to receive msg...")
while True:
    # Extract message and client address from received msg
    message, client_address = server_socket.recvfrom(2048)
    # Create response message
    print(client_address, message)
    # server_socket.sendto(modified_message, client_address)