#!/bin/bash
#========================================================================================
# mongobackup.sh: Run mongodump in the waptrdb (mongodb) container
# Prerequisites: 
# - Set the REM_BACKUP_DIR env. variable if the backup needs to be pushed to a remote host.
#========================================================================================
LOC_BACKUP_DIR="$PWD/../backup"
CTR_BACKUP_DIR="/app/backup"
SVC_NAME="waptrdb"

read -p "Back-up MongoDB? [n] " answer
if [ "$answer" = y ];then
    mv "$LOC_BACKUP_DIR/waptrunner" "${LOC_BACKUP_DIR}/waptrunner.$(date +%Y%m%d).$$" 2>/dev/null
    mkdir "$LOC_BACKUP_DIR" 2>/dev/null
    docker-compose exec "$SVC_NAME" /usr/bin/mongodump --db=waptrunner --host 127.0.0.1:27017 -o "$CTR_BACKUP_DIR"
fi

if [ "$REM_BACKUP_DIR" != "" ];then
    read -p "Push the backed-up data to remote host? [n] " answer
    if [ "$answer" = y ];then
       scp -rp "$LOC_BACKUP_DIR/waptrunner" "$REM_BACKUP_DIR"
    fi
fi
