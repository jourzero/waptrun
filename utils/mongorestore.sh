#!/bin/bash
#========================================================================================
# mongorestore.sh: Run mongorestore from within the waptr container
# Prerequisite: Set the MONGODB_URL env. variable if the import is for a remote DB.
#========================================================================================
MONGODB_URL_LOCAL="mongodb://waptrdb:27017/waptrunner"
DEFAULT_DIR="/app/data/backup"

read -p "Do you want the operation on local DB ($MONGODB_URL_LOCAL)? [y]: " answer
if [ "$answer" = "" -o "$answer" = "y" ];then
    MONGODB_URL="$MONGODB_URL_LOCAL"
fi

read -p "Data directory to restore [$DEFAULT_DIR] " DIR
if [ "$DIR" = "" ];then
    DIR="$DEFAULT_DIR"
fi
if [ -d "$DIR" ];then
    echo -e "-- Restoring data from $DIR..."
    mongorestore --drop --uri="$MONGODB_URL" "$DIR"
else
    echo -e "ERROR: Directory $DIR does not exist"
    exit 1
fi