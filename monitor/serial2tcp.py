import serial
import socket
import signal

# sognal to quit: close socket and serial
def signal_handler(sig, frame):
    print('You pressed Ctrl+C!')
    sock.close()
    serialPort.close()
    exit(0)

# attach signal
signal.signal(signal.SIGINT, signal_handler)

# create tcp socket
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.settimeout(5) # for 5 sec
sock.connect(('0.0.0.0', 8080)) # '
# check if connection succes
print("connected")

# connect to serial port
serialPort = serial.Serial(port = "/dev/ttyUSB0", baudrate=115200, bytesize=8, timeout=2, stopbits=serial.STOPBITS_ONE)

# send data received on serial port to tcp socket
while True:
    # check if data on serial
    if(serialPort.in_waiting > 0):
        # read data out of the buffer until a carraige return / new line is found
        serialString = serialPort.readline()
        print(serialString)
        sock.send(serialString)

