#!/bin/bash
#======================================================
# entrypoint.sh: Container entry point for waptrun app
#======================================================
cd /app 2>/dev/null
DATA_DIR="/app/data"
INIT_DIR="/app/dbinit"
DB_FILE="waptrun.sqlite3"

echo -e "\n\n=== Starting $0 in ${WAPTRUN_ENV} mode ==="

# Make sure we're in the container
if [ "${PWD}" != "/app" ];then  
    echo "ERROR: $0 is not running in container, exiting immediately."
    exit 1
fi

# Make sure Dev vs Prod environment is configured
if [ "${WAPTRUN_ENV}" != "DEV" -a "${WAPTRUN_ENV}" != "PROD" ];then
    echo "ERROR: $0 cannot determine the value for WAPTRUN_ENV variable, exiting immediately."
    exit 1
fi

# If in Prod/remote mode, pull the code from Github 
if [ "${WAPTRUN_ENV}" = "PROD" ];then
    if [ -d /app/server ];then
        /app/utils/updateFromGithub.sh
    else
        echo -e "\n\n-- Cloning waptrun project"
        git clone https://github.com/jourzero/waptrun.git
        mv waptrun/* . 2>/dev/null
        #echo -e "\n\n-- Listing cloned data"
        #ls -a
    fi
fi

# Install node modules
echo -e "\n\n-- Installing node modules"
npm install

# Initialize DB if needed
if [ ! -f "${DATA_DIR}/${DB_FILE}" ];then
    echo "WARNING: DB file ${DATA_DIR}/${DB_FILE} not present, using a fresh DB file with no project."
    cp "${INIT_DIR}/${DB_FILE}" "${DATA_DIR}/${DB_FILE}"
fi 

# Start the app using nodemon for automatic restarts on code changes
echo -e "\n\n-- Starting app"
npm run dev