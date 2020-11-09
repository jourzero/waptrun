#!/bin/bash
#========================================================================================
# mongo.sh: Run mongo CLI in the mongo container
#========================================================================================
MONGODB_URL_LOCAL="mongodb://waptrdb:27017/waptrunner"
CMD="docker-compose exec waptrdb /usr/bin/mongo"

read -p "Do you want the operation on local DB ($MONGODB_URL_LOCAL)? [y]: " answer
if [ "$answer" = "" -o "$answer" = "y" ];then
    MONGODB_URL="$MONGODB_URL_LOCAL"
fi
$CMD $MONGODB_URL $*