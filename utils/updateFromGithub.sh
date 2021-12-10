#!/bin/bash
#==================================================
# updateFromGithub.sh: Update app from Github
#==================================================
cd /app 2>/dev/null

# Make sure we're in the container
if [ "${PWD}" != "/app" ];then  
    echo "ERROR: $0 is not running in container, exiting immediately."
    exit 1
fi

# Make sure we're not in Dev
if [ "${WAPTRUN_ENV}" != "PROD" ];then
    echo "ERROR: $0 is not running in Prod, exiting immediately."
    exit 1
fi

 # Setup for pull only
git config pull.ff only 

# Pull latest code
git pull https://github.com/jourzero/waptrun.git
