#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys, fcntl, time, socket, os.path

if len(sys.argv) > 1:
    if sys.argv[1] == "--config":
        config = True
    else:
        print "\n" + sys.argv[1], " --->" + "   is not a valid argument\n\nValid Arguments:\n--config          reconfigure IP-Address and Port\n"
        sys.exit()
else:
    config = False

configFile = "voc-monitor_udp-client.conf"

if os.path.isfile(configFile) == False or config == True:
    f = open(configFile,"w+")
    iobroker_ip_address = raw_input("Enter the ioBroker IP-Address: ")
    f.write(iobroker_ip_address)
    f.write(":")
    iobroker_adapter_port = input("Enter the ioBroker Adapter Port: ")
    f.write(str(iobroker_adapter_port))
    f.close()
else:
    f = open(configFile,"r")
    if f.mode == 'r':
        iobroker_conf = f.read()
        iobroker_ip_address = iobroker_conf.split(':')[0]
        iobroker_adapter_port = int(iobroker_conf.split(':')[1])
        f.close()

# Open UDP-Socket
addr = (iobroker_ip_address, iobroker_adapter_port)
UDPSock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
print "Open UDP-Socket to", iobroker_ip_address, "on port", iobroker_adapter_port

with open("/dev/voc-monitor","a+b") as vocDevice:
    while True:
        vocDevice.write("\x40\x68\x2a\x54\x52\x0a\x40\x40\x40\x40\x40\x40\x40\x40\x40\x40")
        data = list(hex(ord(n)) for n in vocDevice.read(16))
        newVoc = (int(data[3], base=16) << 8) + int(data[2], base=16)
        voc = "VOC=%i" % newVoc
        UDPSock.sendto(voc, addr)
        print (voc)
        time.sleep(2)
