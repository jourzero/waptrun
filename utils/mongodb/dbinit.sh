#!/bin/bash
#===============================================================================================================
# dbinit.sh: Initialize the MongoDB (from data files) within the mongodb container.
#
# Prerequisite: a previous MongoDB backup exists under /app/dbinit/waptrunner (within the DB container).
#===============================================================================================================
SVC_NAME="waptrdb"
RESTORE_DIR="/app/dbinit/waptrunner"
WAIT_TIME=2
MONGODB_HOST="127.0.0.1:27017"


echo -e "\n\nWARNING: In $WAIT_TIME seconds, this will (re-)initialize the waptrunner DB. You may lose existing project data! Press CTRL-C to quit..."
sleep "$WAIT_TIME"

# Restore mongodb data from before
CMD[0]='free -h' 
CMD[1]="ls $RESTORE_DIR"
CMD[2]="/usr/bin/mongorestore --db=waptrunner --drop --host $MONGODB_HOST ${RESTORE_DIR}"

for i in $(seq 0 2);do
    echo -e "\n-- Executing this in container ${CONTAINER_NAME}: ${CMD[$i]}..." 
    sleep 1
    docker-compose exec "$SVC_NAME" ${CMD[$i]}
done

