#!/bin/bash
set -x
#========================================================================================
# mongoimport.sh: Run mongoimport from within the waptr container
# Prerequisite: Set the MONGODB_URL env. variable if the import is for a remote DB.
#========================================================================================
COLLECTIONS[1]="testkb"
COLLECTIONS[2]="issues"
COLLECTIONS[3]="project"
FIELDS[1]='TID.string(),TSource.string(),TTestName.string(),TType.string(),TDescription.string(),TIssueName.string(),TIssueType.string(),TSeverity.int32(),TTesterSupport.string(),TPhase.string(),TSection.string(),TStep.string(),TIssueBackground.string(),TRemediationBackground.string(),TRef1.string(),TRef2.string(),TTRef.string(),TCweID.string(),TPCI.boolean(),TTop10.boolean(),TTop25.boolean(),TStdTest.boolean()'
FIELDS[2]='PrjName.string(),TID.string(),CweId.int32(),TIssueName.string(),TIssueBackground.string(),TRemediationBackground.string(),TSeverity.int32(),TRef1.string(),TRef2.string(),TSeverityText.string(),IURIs.string(),IEvidence.string(),IPriority.int32(),IPriorityText.string(),INotes.string()'
FIELDS[3]='name.string(),scope.string(),scopeQry.string(),lastTID.string()'
NUM_COLLS=1 # only import testkb
NUM_COLLS=3 # import all collections
INPUT_DIR="/app/data"
MONGODB_URL_LOCAL="mongodb://waptrdb:27017/waptrunner"

read -p "Do you want the operation on local DB ($MONGODB_URL_LOCAL)? [y]: " answer
if [ "$answer" = "" -o "$answer" = "y" ];then
    MONGODB_URL="$MONGODB_URL_LOCAL"
fi

for i in $(seq 1 $NUM_COLLS);do
    IN_FILENAME="$INPUT_DIR/${COLLECTIONS[$i]}.csv"
    read -p "-- Import data to ${COLLECTIONS[$i]} collection from $IN_FILENAME? [n] " answer
    if [ "$answer" != "y" ];then
        continue
    fi
    if [ -f "$IN_FILENAME" ];then
        mongoimport \
        --db=waptrunner \
        --collection="${COLLECTIONS[$i]}" \
        --file="$IN_FILENAME"  \
        --type=csv \
        --columnsHaveTypes \
        --headerline \
        --ignoreBlanks \
        --drop  \
        $MONGODB_URL
        #--fields="${FIELDS[$i]}" \
    else
        echo "ERROR: Input file ../$IN_FILENAME does not exist"
    fi
done