#!/bin/bash
#======================================================
# entrypoint.sh: Container entry point for waptrun app
#======================================================
cd /app 2>/dev/null

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

# If in Prod mode, pull the code from Github and initialize DB if needed
if [ "${WAPTRUN_ENV}" = "PROD" ];then
    /app/utils/updateFromGithub.sh
    if [ -]
fi

# Install node modules
RUN npm install

# Start the app using nodemon for automatic restarts on code changes
echo -e "\n\n-- Starting app"
npm run dev
