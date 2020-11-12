#!/bin/bash
#==========================================================================================================
# Import OWASP ASVS data into TestKB
# Prerequisite: CSV file data/testkb-ASVS.csv with the same schema as TestKB
#==========================================================================================================
HOST_DATA_DIR="$PWD/../data"
CTR_DATA_DIR="/app/data"
CSV_HEADER='TID.string(),TSource.string(),TTestName.string(),TType.string(),TDescription.string(),TIssueName.string(),TIssueType.string(),TSeverity.int32(),TTesterSupport.string(),TPhase.string(),TSection.string(),TStep.string(),TIssueBackground.string(),TRemediationBackground.string(),TRef1.string(),TRef2.string(),TTRef.string(),TCweID.string(),TPCI.boolean(),TTop10.boolean(),TTop25.boolean(),TStdTest.boolean()'
CSV_FILE="$PWD/../data/testkb-OwaspASVS.csv"
CONTAINER_INPUT_DIR="/app/data"
COLLECTION="testkb"
MONGODB_URL_LOCAL="mongodb://waptrdb:27017/waptrunner"
SVC_NAME="app"
DOWNLOAD_URL="https://raw.githubusercontent.com/OWASP/ASVS/v4.0.2/4.0/docs_en/OWASP%20Application%20Security%20Verification%20Standard%204.0.2-en.csv"
DOWNLOADED_CSVFILE="$HOST_DATA_DIR/asvs-data-from-owasp.csv"
IMPORTED_CSVFILE="$HOST_DATA_DIR/testkb-ASVS.csv"
IMPORTED_CSVFILE_CTR="$CTR_DATA_DIR/testkb-ASVS.csv"

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

# Get path for mongoimport tool
TOOL_PATH=$(ls ./mongodb-database-tools*/bin/mongoimport)
if [ $? -ne 0 -a -f "$TOOL_PATH" ];
then
    echo "ERROR Could not find the tool path"
    exit 3
else
    echo "Tool path: $TOOL_PATH"
fi
CMD="docker-compose exec $SVC_NAME /app/utils/$TOOL_PATH"

# Import CSV data (append)
read -p "Import data to ${COLLECTION} collection from $IMPORTED_CSVFILE_CTR? [n] " answer
if [ "$answer" = "y" ];then
    $CMD \
    --db=waptrunner \
    --collection="${COLLECTION}" \
    --file="$IMPORTED_CSVFILE_CTR"  \
    --type=csv \
    --columnsHaveTypes \
    --headerline \
    --ignoreBlanks \
    $MONGODB_URL
fi
