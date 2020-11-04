#!/bin/bash
if [ $# -ne 2 ];then
    echo "Usage: $0 HOST PORTS"
    echo "HOST: Target host. To test egress filtering, use portquiz.net"
    echo "PORTS: Comma-separated list of ports - e.g. 22,25,53,135,139,443,445,646,711"
    exit 1
else
   HOST="$1"
   PORTLIST="$2"
fi

# Use nmap if available. Otherwise, use built-in Linux features.
which map >/dev/null
if [ $? -eq 0 ];then
    nmap -p "$PORTLIST" "$HOST"
else
    for port in $(echo "$PORTLIST" | sed 's/,/ /g');do 
        (echo >/dev/tcp/${HOST}/${port}) &>/dev/null && echo "Port $port is open" || echo "Port $port is closed"
    done
fi
