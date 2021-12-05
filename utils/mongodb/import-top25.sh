#!/bin/bash
#==========================================================================================================
# Import SANS/CWE Top 25 data into TestKB
# Prerequisite: CSV file data/testkb-CweTop25.csv with the same schema as TestKB
#==========================================================================================================
CSV_HEADER='TID.string(),TSource.string(),TTestName.string(),TType.string(),TDescription.string(),TIssueName.string(),TIssueType.string(),TSeverity.int32(),TTesterSupport.string(),TPhase.string(),TSection.string(),TStep.string(),TIssueBackground.string(),TRemediationBackground.string(),TRef1.string(),TRef2.string(),TTRef.string(),TCweID.string(),TPCI.boolean(),TTop10.boolean(),TTop25.boolean(),TStdTest.boolean()'
CSV_FILE="$PWD/../data/testkb-CweTop25.csv"
CONTAINER_INPUT_DIR="/app/data"
CONTAINER_CSV_FILE="${CONTAINER_INPUT_DIR}/testkb-CweTop25.csv"
COLLECTION="testkb"
MONGODB_URL_LOCAL="mongodb://waptrdb:27017/waptrunner"
SVC_NAME="app"

# Get path for mongoimport tool
TOOL_PATH=$(ls mongodb-database-tools*/bin/mongoimport)
if [ $? -ne 0 -a -f "$TOOL_PATH" ];
then
    echo "ERROR Could not find the tool path"
    exit 1
fi
CMD="docker-compose exec $SVC_NAME /app/utils/$TOOL_PATH"

# Prompt for destination
read -p "Do you want the import operation on local DB ($MONGODB_URL_LOCAL)? [y]: " answer
if [ "$answer" = "" -o "$answer" = "y" ];then
    MONGODB_URL="$MONGODB_URL_LOCAL"
fi

# Import CSV data (append)
read -p "Import data to ${COLLECTION} collection from $CONTAINER_CSV_FILE? [n] " answer
if [ "$answer" = "y" ];then
    $CMD \
    --db=waptrunner \
    --collection="${COLLECTION}" \
    --file="$CONTAINER_CSV_FILE"  \
    --type=csv \
    --columnsHaveTypes \
    --headerline \
    --ignoreBlanks \
    $MONGODB_URL
else
    echo "ERROR: Input file ../$IN_FILENAME does not exist"
fi
