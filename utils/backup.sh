#!/bin/bash
#========================================================================================
# backup.sh: Backup the sqlite DB 
#========================================================================================
NOW="$(date +%Y%m%d-%H%M%S)"
DB_DIR="/app/data"
DB_FILE="${DB_DIR}/waptrun.sqlite3"
BACKUP_DIR="/app/backup"
BACKUP_FILE="waptrun.sql"

cd "${BACKUP_DIR}"
echo -e "\n- Running sqlite dump and saving to ${BACKUP_FILE}..."
/usr/bin/sqlite3 "${DB_FILE}" .dump > "${BACKUP_FILE}"

echo -e "\n- Compressing to ${BACKUP_FILE}.${NOW}.tgz..."
tar cvfz "${BACKUP_FILE}.${NOW}.tgz" "${BACKUP_FILE}"