#!/bin/bash
#===============================================================================================================
# restore-container-db.sh: Restore/populate the MongoDB (from data files) that's running in the waptrdb container.
#
# Prerequisite: a previous MongoDB backup should exist under /backup/waptrunning, within the waptrdb container
#===============================================================================================================
CONTAINER_NAME="waptrdb"
RESTORE_DIR="/backup/waptrunner"

read -p "This will execute mongorestore and you may lose existing waptrunner data in MongoDB. Proceed? [n] " answer

if [ "$answer" = y ];then

  # Restore mongodb data from before
  CMD[0]='free -h' 
  CMD[1]='fallocate -l 1G /swapfile'
  CMD[2]='chmod 600 /swapfile'
  CMD[3]='mkswap /swapfile'
  CMD[4]='swapon /swapfile'
  CMD[5]='free -h'
  CMD[6]="ls $RESTORE_DIR"
  CMD[7]="/usr/bin/mongorestore --db=waptrunner ${RESTORE_DIR} --drop --host 127.0.0.1:27017"
  for i in $(seq 0 7);do
    read -p "Execute this in container ${CONTAINER_NAME}: ${CMD[$i]} ? [n] " answer
    if [ "$answer" = y ];then
      docker exec "$CONTAINER_NAME" ${CMD[$i]}
    fi
  done

fi
