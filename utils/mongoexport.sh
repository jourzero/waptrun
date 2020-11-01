#!/bin/bash
#========================================================================================
# mongoexport.sh: Run mongoexport in Docker container, using MONGODB_URL from .env
#========================================================================================
. ../.env
CONTAINER_NAME="waptrdb"
DB=waptrunner
COLLECTIONS[1]="testkb"
COLLECTIONS[2]="issues"
COLLECTIONS[3]="project"
COLLECTIONS[4]="cwe"
FIELDS[1]="TID,TSource,TTestName,TType,TDescription,TIssueName,TIssueType,TSeverity,TTesterSupport,TPhase,TSection,TStep,TIssueBackground,TRemediationBackground,TStdTest,TRef1,TRef2,TTRef,TCweID,TPCI,TTop10,TTop25"
#FIELDS[2]='PrjName,TID,CweId,TIssueName,TIssueBackground,TRemediationBackground,TSeverity,TRef1,TRef2,TSeverityText,IURIs,IEvidence,IScreenshots,IPriority,IPriorityText,INotes'
FIELDS[2]='PrjName,TID,CweId,TIssueName,TIssueBackground,TRemediationBackground,TSeverity,TRef1,TRef2,TSeverityText,IURIs,IEvidence,IPriority,IPriorityText,INotes'
FIELDS[3]='name,scope,scopeQry,lastTID'
FIELDS[4]='ID,Name,Weakness_Abstraction,Status,Description_Summary,Extended_Description,Related_Weaknesses,Weakness_Ordinalities,Applicable_Platforms,Background_Details,Alternate_Terms,Modes_Of_Introduction,Exploitation_Factors,Likelihood_of_Exploit,Common_Consequences,Detection_Methods,Potential_Mitigations,Observed_Examples,Functional_Areas,Affected_Resources,Taxonomy_Mappings,Related_Attack_Patterns,Notes'
NUM_COLLS=4
EXPORT_TYPE="csv"
OUTPUT_DIR=/utils/export


for i in $(seq 1 $NUM_COLLS);do
    OUT_FILENAME="$OUTPUT_DIR/mongoexport.${COLLECTIONS[$i]}.$$.csv"
    echo -e "\n-- Exporting data from ${COLLECTIONS[$i]} collection to $OUT_FILENAME..."
    docker exec -it "$CONTAINER_NAME" /usr/bin/mongoexport \
    --fields="${FIELDS[$i]}" \
    --collection="${COLLECTIONS[$i]}" \
    --out="$OUT_FILENAME" \
    --type="$EXPORT_TYPE" \
    $MONGODB_URL
done