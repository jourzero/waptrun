#!/bin/bash
#========================================================================================
# backup.sh: Backup the Mongo DB 
#========================================================================================
CTR_BACKUP_DIR="/app/backup"
NOW="$(date +%Y%m%d-%H%M%S)"
DB="waptrunner"
COLLECTIONS[1]="testkb"
COLLECTIONS[2]="issues"
COLLECTIONS[3]="project"
COLLECTIONS[4]="cwe"
FIELDS[1]="TID,TSource,TTestName,TType,TDescription,TIssueName,TIssueType,TSeverity,TTesterSupport,TPhase,TSection,TStep,TIssueBackground,TRemediationBackground,TStdTest,TRef1,TRef2,TTRef,TCweID,TPCI,TTop10,TTop25"
# NOTE: The below field list excludes IScreenshots (from issues collection), to avoid breaking CSV and for smaller/editable exports
FIELDS[2]='PrjName,TID,CweId,TIssueName,TIssueBackground,TRemediationBackground,TSeverity,TRef1,TRef2,TSeverityText,IURIs,IEvidence,IPriority,IPriorityText,INotes'
FIELDS[3]='name,TTestNameKeyword,scope,scopeQry,PciTests,StdTests,Top10Tests,Top25Tests,notes,software'
FIELDS[4]='ID,Name,Weakness_Abstraction,Status,Description_Summary,Extended_Description,Related_Weaknesses,Weakness_Ordinalities,Applicable_Platforms,Background_Details,Alternate_Terms,Modes_Of_Introduction,Exploitation_Factors,Likelihood_of_Exploit,Common_Consequences,Detection_Methods,Potential_Mitigations,Observed_Examples,Functional_Areas,Affected_Resources,Taxonomy_Mappings,Related_Attack_Patterns,Notes'
NUM_COLLS=4
EXPORT_TYPE="csv"

# Perform export on all target collections
exportAll(){
    for i in $(seq 1 $NUM_COLLS);do
        OUT_FILENAME="$CTR_BACKUP_DIR/${COLLECTIONS[$i]}.csv"
        echo -e "\n-- Exporting data from ${COLLECTIONS[$i]} collection to $OUT_FILENAME..."
        /usr/bin/mongoexport \
        --db="${DB}" \
        --host 127.0.0.1:27017 \
        --fields="${FIELDS[$i]}" \
        --collection="${COLLECTIONS[$i]}" \
        --type="$EXPORT_TYPE" \
        --out="$OUT_FILENAME"
    done
}

# Backup DB using tools in the DB container
echo -e "\n"
echo -e "\n- Creating container backup directory ${CTR_BACKUP_DIR}, just in case..."
mkdir "${CTR_BACKUP_DIR}" 

echo -e "\n- Running mongodump and saving ${DB} DB to ${CTR_BACKUP_DIR}..."
/usr/bin/mongodump --db="${DB}" --host 127.0.0.1:27017 -o "$CTR_BACKUP_DIR"

echo -e "\n- Running export and saving ${DB} collections to ${CTR_BACKUP_DIR}..."
exportAll 

echo -e "\n- Compressing to ${CTR_BACKUP_DIR}/${DB}.${NOW}.$$.tgz..."
tar cvfz "${CTR_BACKUP_DIR}/${DB}.${NOW}.$$.tgz" "$CTR_BACKUP_DIR/${DB}" \
    "$CTR_BACKUP_DIR/cwe.csv" "$CTR_BACKUP_DIR/issues.csv" "$CTR_BACKUP_DIR/project.csv" "$CTR_BACKUP_DIR/testkb.csv"