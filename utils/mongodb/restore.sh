#!/bin/bash
#========================================================================================
# restore.sh: Run mongorestore in the waptrun container
#
# Prereq.: PATH variable should include path for mongorestore
#========================================================================================
BACKUP_DIR="/app/backup"
BACKUP_DIR="/app/wapt-configs/db/app/backup"

# Restore to local DB
read -p "Restore MongoDB from directory ${BACKUP_DIR}? [n] " answer
if [ "$answer" = y ];then
    mongorestore --drop --db=waptrunner --host 127.0.0.1:27017 "$BACKUP_DIR/waptrunner" 
fi
