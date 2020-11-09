#!/bin/bash
#========================================================================================
# backup-container-db.sh: Run mongodump in the waptrdb container (where our mongoDB is).
#========================================================================================
CONTAINER_NAME="waptrdb"
#BACKUP_DIR="/backup/waptrunner.$(date +%Y%m%d)"
BACKUP_DIR="/utils/waptrunner.$(date +%Y%m%d).$$"

read -p "Back-up MongoDB to directory ${BACKUP_DIR} [n] " answer
if [ "$answer" = y ];then
  docker exec "$CONTAINER_NAME" mkdir $BACKUP_DIR 
  docker exec "$CONTAINER_NAME" /usr/bin/mongodump --db=waptrunner --host 127.0.0.1:27017 -o $BACKUP_DIR
fi

read -p "View content of backup directory ${BACKUP_DIR} [n] " answer
if [ "$answer" = y ];then
  docker exec "$CONTAINER_NAME" ls -lR $BACKUP_DIR
fi
