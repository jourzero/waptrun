#!/bin/bash
#========================================================================================
# backup.sh: Backup the sqlite DB 
#========================================================================================
NOW="$(date +%Y%m%d-%H%M%S)"
DB_DIR="/app/data"
DB_FILE="waptrun.sqlite3"
BACKUP_DIR="/app/backup"
BACKUP_FILE="waptrun.sql"

# Make sure we're in the container
cd "${BACKUP_DIR}"
if [ "${PWD}" != "${BACKUP_DIR}" ];then  
    echo "ERROR: $0 is not running in container, exiting immediately."
    exit 1
fi

# Copy the sqlite3 file to backup dir
echo -e "\n- Copying sqlite data file to ${BACKUP_DIR}/${DB_FILE}..."
cp -p "${DB_DIR}/${DB_FILE}" .

# Compress sqlite3 file to tgz with today's date in the name
echo -e "\n- Compressing to ${DB_FILE}.${NOW}.tgz..."
tar cvfz "${DB_FILE}.${NOW}.tgz" "${DB_FILE}"

# Dump DB content to file under backup dir
echo -e "\n- Running sqlite dump and saving to ${BACKUP_FILE}..."
/usr/bin/sqlite3 "${DB_DIR}/${DB_FILE}" .dump > "${BACKUP_FILE}"

# Compress DB dump file to tgz with today's date in the name
echo -e "\n- Compressing to ${BACKUP_FILE}.${NOW}.tgz..."
tar cvfz "${BACKUP_FILE}.${NOW}.tgz" "${BACKUP_FILE}"