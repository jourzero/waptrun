#!/bin/bash
#========================================================================================
# mongoimport.sh: Run mongoimport from within the waptr container
#
# Prerequisite: Set the MONGODB_URL env. variable if the import is for a remote DB.
#========================================================================================
#CONTAINER_NAME="waptrdb"
COLLECTIONS[1]="testkb"
COLLECTIONS[2]="issues"
COLLECTIONS[3]="project"
COLLECTIONS[4]="cwe"
#NUM_COLLS=4 # import all collections
NUM_COLLS=1 # only import testkb
INPUT_DIR="/app/data"
MONGODB_URL_LOCAL="mongodb://waptrdb:27017/waptrunner"

read -p "Do you want the operation on local DB ($MONGODB_URL_LOCAL)? [y]: " answer
if [ "$answer" = "" -o "$answer" = "y" ];then
    MONGODB_URL="$MONGODB_URL_LOCAL"
fi

for i in $(seq 1 $NUM_COLLS);do
    IN_FILENAME="$INPUT_DIR/${COLLECTIONS[$i]}.csv"
    echo -e "\n-- Importing data to ${COLLECTIONS[$i]} collection from $IN_FILENAME..."
    if [ -f "$IN_FILENAME" ];then
        mongoimport \
        --headerline \
        --db=waptrunner \
        --collection="${COLLECTIONS[$i]}" \
        --file="$IN_FILENAME"  \
        --type=csv \
        --drop  \
        $MONGODB_URL
    else
        echo "ERROR: Input file ../$IN_FILENAME does not exist"
    fi
done