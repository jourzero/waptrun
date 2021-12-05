#!/bin/bash
#==========================================================================================================
# Import OWASP API Top 10 data into TestKB
# Prerequisite: CSV file ../data/testkb-owasp-api-top10.csv with subset of TestKB schema
#==========================================================================================================
CTR_DATA_DIR="/app/data"
CSV_HEADER='TStep.string(),TID.string(),TSource.string(),TTestName.string(),TDescription.string()'
COLLECTION="testkb"
MONGODB_URL_LOCAL="mongodb://127.0.0.1:27017/waptrunner"
SVC_NAME="waptrdb"
IMPORTED_CSVFILE_CTR="$CTR_DATA_DIR/testkb-owasp-api-top10.csv"

# Prompt for destination
read -p "Do you want the operation on local DB ($MONGODB_URL_LOCAL)? [y]: " answer
if [ "$answer" = "" -o "$answer" = "y" ];then
    MONGODB_URL="$MONGODB_URL_LOCAL"
fi

# Check if we have the MongoDB URL
if [ "$MONGODB_URL" == "" ];then
  echo "Missing MongoDB URL in MONGODB_URL env. var! Exiting."  
  exit 2
fi

# Import CSV data (append)
read -p "Import data to ${COLLECTION} collection from $IMPORTED_CSVFILE_CTR? [n] " answer
if [ "$answer" = "y" ];then
    docker-compose exec $SVC_NAME /usr/bin/mongoimport \
    --db=waptrunner \
    --collection="${COLLECTION}" \
    --file="$IMPORTED_CSVFILE_CTR"  \
    --type=csv \
    --columnsHaveTypes \
    --headerline \
    --ignoreBlanks \
    $MONGODB_URL
fi