#!/bin/bash
#========================================================================================
# mongo.sh: Run mongo CLI in local container
#========================================================================================
. ../.env
CONTAINER_NAME="waptrdb"
docker exec -it "$CONTAINER_NAME" /usr/bin/mongo $MONGODB_URL