import socket

# # Create a TCP/IP socket
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

# # print all data received on the socket
sock.bind(("0.0.0.0", 8080))
sock.listen(5)
while True:
    print("start")
    conn, addr = sock.accept()
    print('Connected by', addr)
    while True:
        data = conn.recv(1024)
        print(data)
        if not data:
            break
        print(data.decode('utf-8'))
