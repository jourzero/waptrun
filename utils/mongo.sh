#!/bin/bash
#========================================================================================
# mongo.sh: Run mongo CLI in the mongo container
#========================================================================================
MONGODB_URL="mongodb://127.0.0.1:27017/waptrunner"
CMD="mongo"

# Run mongo shell
#$CMD $MONGODB_URL $*
/usr/bin/mongo $MONGODB_URL $*
