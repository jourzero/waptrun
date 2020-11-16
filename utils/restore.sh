#!/bin/bash
#========================================================================================
# mongorestore.sh: Run mongorestore in the waptrdb (mongodb) container
# Prerequisites: 
# - Set the REM_BACKUP_DIR env. variable if the backup needs to be pulled from a remote host.
#========================================================================================
LOC_BACKUP_DIR="$PWD/../backup"
CTR_BACKUP_DIR="/app/backup"
SVC_NAME="waptrdb"

# Pull a remote backup
if [ "$REM_BACKUP_DIR" != "" ];then
    read -p "Pull backup data from remote host? [n] " answer
    if [ "$answer" = y ];then
        scp -rp "$REM_BACKUP_DIR/app/backup/waptrunner" "$LOC_BACKUP_DIR"
    fi
fi

# Restore to local DB
read -p "Restore MongoDB to local directory ${BACKUP_DIR} in $SVC_NAME container? [n] " answer
if [ "$answer" = y ];then
    docker-compose exec "$SVC_NAME" /usr/bin/mongorestore --drop --db=waptrunner --host 127.0.0.1:27017 "$CTR_BACKUP_DIR/waptrunner"
fi
