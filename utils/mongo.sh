#!/bin/bash
#========================================================================================
# mongo.sh: Run mongo CLI 
#========================================================================================
CONTAINER_NAME="waptrdb"
MONGODB_URL_LOCAL="mongodb://waptrdb:27017/waptrunner"

read -p "Do you want the operation on local DB ($MONGODB_URL_LOCAL)? [y]: " answer
if [ "$answer" = "" -o "$answer" = "y" ];then
    MONGODB_URL="$MONGODB_URL_LOCAL"
fi
docker exec -it "$CONTAINER_NAME" /usr/bin/mongo $MONGODB_URL