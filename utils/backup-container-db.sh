#!/bin/bash
#========================================================================================
# backup-container-db.sh: Run mongodump in the waptrdb/mongodb container
#========================================================================================
BACKUP_DIR="/app/backup/waptrunner.$(date +%Y%m%d).$$" 
SVC_NAME="waptrdb"

read -p "Back-up MongoDB to directory ${BACKUP_DIR} in $SVC_NAME container? [n] " answer
if [ "$answer" = y ];then
  docker-compose exec "$SVC_NAME" mkdir $BACKUP_DIR 
  docker-compose exec "$SVC_NAME" /usr/bin/mongodump --db=waptrunner --host 127.0.0.1:27017 -o $BACKUP_DIR
fi

read -p "View content of backup directory ${BACKUP_DIR} [n] " answer
if [ "$answer" = y ];then
  docker-compose exec "$SVC_NAME" ls -lR $BACKUP_DIR
fi
