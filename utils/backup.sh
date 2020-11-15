#!/bin/bash
#========================================================================================
# backup.sh: Backup the Mongo DB in the waptrdb container (mongo image)
# Prerequisites: 
# - Set the REM_BACKUP_DIR env. variable if the backup needs to be pushed to a remote host.
#========================================================================================
HOST_BACKUP_DIR="$PWD/../backup"
HOST_DOWNLOADS_DIR="$HOME/Downloads"
CTR_BACKUP_DIR="/app/backup"
SVC_NAME="waptrdb"
TODAY="$(date +%Y%m%d)"
DB="waptrunner"
COLLECTIONS[1]="testkb"
COLLECTIONS[2]="issues"
COLLECTIONS[3]="project"
COLLECTIONS[4]="cwe"
FIELDS[1]="TID,TSource,TTestName,TType,TDescription,TIssueName,TIssueType,TSeverity,TTesterSupport,TPhase,TSection,TStep,TIssueBackground,TRemediationBackground,TStdTest,TRef1,TRef2,TTRef,TCweID,TPCI,TTop10,TTop25"
# NOTE: The below field list excludes IScreenshots (from issues collection), to avoid breaking CSV and for smaller/editable exports
FIELDS[2]='PrjName,TID,CweId,TIssueName,TIssueBackground,TRemediationBackground,TSeverity,TRef1,TRef2,TSeverityText,IURIs,IEvidence,IPriority,IPriorityText,INotes'
FIELDS[3]='name,scope,scopeQry,lastTID'
FIELDS[4]='ID,Name,Weakness_Abstraction,Status,Description_Summary,Extended_Description,Related_Weaknesses,Weakness_Ordinalities,Applicable_Platforms,Background_Details,Alternate_Terms,Modes_Of_Introduction,Exploitation_Factors,Likelihood_of_Exploit,Common_Consequences,Detection_Methods,Potential_Mitigations,Observed_Examples,Functional_Areas,Affected_Resources,Taxonomy_Mappings,Related_Attack_Patterns,Notes'
NUM_COLLS=4
EXPORT_TYPE="csv"

# Perform export on all target collections
exportAll(){
    for i in $(seq 1 $NUM_COLLS);do
        OUT_FILENAME="$CTR_BACKUP_DIR/${COLLECTIONS[$i]}.csv"
        echo -e "\n-- Exporting data from ${COLLECTIONS[$i]} collection to $OUT_FILENAME..."
        docker-compose exec "$SVC_NAME" /usr/bin/mongoexport \
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
#read -p "-- Back-up MongoDB? [n] " answer
#if [ "$answer" = y ];then
    echo -e "\n- Creating container backup directory ${CTR_BACKUP_DIR}, just in case..."
    docker-compose exec "$SVC_NAME" mkdir "${CTR_BACKUP_DIR}" 

    echo -e "\n- Running mongodump and saving ${DB} DB to ${CTR_BACKUP_DIR}..."
    #read -p "Press RETURN to proceed or CTRL-C to quit"
    docker-compose exec "$SVC_NAME" /usr/bin/mongodump --db="${DB}" --host 127.0.0.1:27017 -o "$CTR_BACKUP_DIR"

    echo -e "\n- Running export and saving ${DB} collections to ${CTR_BACKUP_DIR}..."
    #read -p "Press RETURN to proceed or CTRL-C to quit"
    exportAll 

    echo -e "\n- Compressing to ${CTR_BACKUP_DIR}/${DB}.${TODAY}.$$.tgz..."
    #read -p "Press RETURN to proceed or CTRL-C to quit"
    docker-compose exec "$SVC_NAME" tar cvfz "${CTR_BACKUP_DIR}/${DB}.${TODAY}.$$.tgz" "$CTR_BACKUP_DIR"

    #echo -e "\n- Cleaning out ${CTR_BACKUP_DIR}/${DB}/"
    #read -p "Press RETURN to proceed or CTRL-C to quit"
    #docker-compose exec "$SVC_NAME" rm -rf "${CTR_BACKUP_DIR}/${DB}/"
#fi

# Push backup to remote host using SSH/SCP
echo -e "\n"
if [ "$REM_BACKUP_DIR" != "" ];then
    #read -p "-- Push backup to remote host? [n] " answer
    #if [ "$answer" = y ];then
        echo -e "\n- Pushing ${HOST_BACKUP_DIR}/${DB}.${TODAY}.$$.tgz to remote directory ${REM_BACKUP_DIR}..."
        #read -p "Press RETURN to proceed or CTRL-C to quit"
        if [ "$answer" = y ];then
           scp -rp "${HOST_BACKUP_DIR}/${DB}.${TODAY}.$$.tgz" "$REM_BACKUP_DIR"
        fi
        echo -e "\n- Move ${HOST_BACKUP_DIR}/${DB}.${TODAY}.$$.tgz to $HOST_DOWNLOADS_DIR..."
        #read -p "Press RETURN to proceed or CTRL-C to quit"
        mv "${HOST_BACKUP_DIR}/${DB}.${TODAY}.$$.tgz" "$HOST_DOWNLOADS_DIR"
    #fi
else
    echo -e "\nNOTE: Variable REM_BACKUP_DIR is not defined, skipping backup to remote host."
fi