#!/bin/bash
#========================================================================================
# mongo.sh: Run mongo CLI in the mongo container
#========================================================================================
MONGODB_URL="mongodb://waptrdb:27017/waptrunner"
MONGODB_URL="mongodb://127.0.0.1:27017/waptrunner"
SVC_NAME="waptrdb"
CMD="docker-compose exec $SVC_NAME /usr/bin/mongo"

# Run mongo shell
#$CMD $MONGODB_URL $*
/usr/bin/mongo $MONGODB_URL $*
