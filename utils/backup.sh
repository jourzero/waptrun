#!/bin/bash
#========================================================================================
# backup.sh: Backup the sqlite DB 
#========================================================================================
NOW="$(date +%Y%m%d-%H%M%S)"
DB_DIR="/app/data"
DB_FILE="waptrun.sqlite3"
BACKUP_DIR="/app/backup"
BACKUP_FILE="waptrun.sql"

cd "${BACKUP_DIR}"
echo -e "\n- Running sqlite dump and saving to ${BACKUP_FILE}..."
/usr/bin/sqlite3 "${DB_DIR}/${DB_FILE}" .dump > "${BACKUP_FILE}"

echo -e "\n- Copying sqlite data file to ${BACKUP_DIR}/${DB_FILE}..."
cp -p "${DB_DIR}/${DB_FILE}" .

echo -e "\n- Compressing to ${DB_FILE}.${NOW}.tgz..."
tar cvfz "${DB_FILE}.${NOW}.tgz" "${DB_FILE}"

echo -e "\n- Compressing to ${BACKUP_FILE}.${NOW}.tgz..."
tar cvfz "${BACKUP_FILE}.${NOW}.tgz" "${BACKUP_FILE}"