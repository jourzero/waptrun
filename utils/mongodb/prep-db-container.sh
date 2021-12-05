#!/bin/bash
#===============================================================================================================
# prep-container-db.sh: Prepare the DB container to provide sufficient virtual memory (when needed)
#===============================================================================================================
SVC_NAME="waptrdb"

read -p "Adjust mongodb container virtual memory (usually not needed). Proceed? [n] " answer

if [ "$answer" = y ];then
  CMD[0]='free -h' 
  CMD[1]='fallocate -l 1G /swapfile'
  CMD[2]='chmod 600 /swapfile'
  CMD[3]='mkswap /swapfile'
  CMD[4]='swapon /swapfile'
  CMD[5]='free -h'
  for i in $(seq 0 5);do
    read -p "Execute this in container ${CONTAINER_NAME}: ${CMD[$i]} ? [n] " answer
    if [ "$answer" = y ];then
      docker-compose exec "$SVC_NAME" ${CMD[$i]}
    fi
  done
fi