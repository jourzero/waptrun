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

# Start app in Dev mode
echo -e "\n\n-- Starting app"
npm run dev