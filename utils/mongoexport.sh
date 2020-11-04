#!/bin/bash
#========================================================================================
# mongoexport.sh: Run mongoexport from within the waptr container
#
# Prerequisite: Set MONGODB_URL env. variable if the export is from a remote DB.
#========================================================================================
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
OUTPUT_DIR=/app/data
MONGODB_URL_LOCAL="mongodb://waptrdb:27017/waptrunner"

read -p "Do you want the operation on local DB ($MONGODB_URL_LOCAL)? [y]: " answer
if [ "$answer" = "" -o "$answer" = "y" ];then
    MONGODB_URL="$MONGODB_URL_LOCAL"
fi

for i in $(seq 1 $NUM_COLLS);do
    OUT_FILENAME="$OUTPUT_DIR/${COLLECTIONS[$i]}.csv"
    echo -e "\n-- Exporting data from ${COLLECTIONS[$i]} collection to $OUT_FILENAME..."
    mkdir -p "$OUTPUT_DIR" 2>/dev/null
    mongoexport \
    --fields="${FIELDS[$i]}" \
    --collection="${COLLECTIONS[$i]}" \
    --out="$OUT_FILENAME" \
    --type="$EXPORT_TYPE" \
    $MONGODB_URL
done