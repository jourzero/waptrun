#!/bin/bash
#========================================================================================
# mongo.sh: Run mongo in the waptrdb container (where our mongoDB is).
#========================================================================================
CONTAINER_NAME="waptrdb"
BACKUP_DIR="/backup/waptrunner.$(date +%Y%m%d)"

docker exec -it "$CONTAINER_NAME" /usr/bin/mongo 127.0.0.1:27017/waptrunner $*
