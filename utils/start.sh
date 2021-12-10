#!/bin/bash

# Configure shares between host and container 
HOST_BASE="$PWD"
CTR_BASE="/app"
MOUNTS=""

# Writable shares (applicable for all deployments)
# Share for DB backups and data files
MOUNTS="$MOUNTS -v ${HOST_BASE}/backup:${CTR_BASE}/backup"
MOUNTS="$MOUNTS -v ${HOST_BASE}/data:${CTR_BASE}/data"
# Share for live environment changes
MOUNTS="$MOUNTS -v ${HOST_BASE}/.env:${CTR_BASE}/.env"

# Read-only shares: static content
MOUNTS="$MOUNTS -v ${HOST_BASE}/waptrun-static:${CTR_BASE}/waptrun-static:ro"
MOUNTS="$MOUNTS -v ${HOST_BASE}/reactive-handlebars:${CTR_BASE}/reactive-handlebars"

# Writable shares for Dev
if [ "$WAPTRUN_ENV" != PROD ];then 
    # Bring dependency updates back to Dev for Github pushes
    MOUNTS="$MOUNTS -v ${HOST_BASE}/package.json:${CTR_BASE}/package.json"
    MOUNTS="$MOUNTS -v ${HOST_BASE}/package-lock.json:${CTR_BASE}/package-lock.json"
    # Allow edits from IDE and immediate effects in Dev container
    MOUNTS="$MOUNTS -v ${HOST_BASE}/dbinit:${CTR_BASE}/dbinit"
    MOUNTS="$MOUNTS -v ${HOST_BASE}/utils:${CTR_BASE}/utils"
    MOUNTS="$MOUNTS -v ${HOST_BASE}/client:${CTR_BASE}/client"
    MOUNTS="$MOUNTS -v ${HOST_BASE}/server:${CTR_BASE}/server"
    # Accelerate npm install and use node_modules on host for IDE code completion
    MOUNTS="$MOUNTS -v ${HOST_BASE}/node_modules:${CTR_BASE}/node_modules"
fi

# Publish specific ports
PUB=""
PUB="${PUB} -p 127.0.0.1:5000:5000"
PUB="${PUB} -p 127.0.0.1:9230:9230"

### Configure run options 
RUN_OPTS="-d -u node:node"

# Run container, mount local dir to /app, name it with the directory name
set -x
docker run ${RUN_OPTS} ${PUB} ${MOUNTS} --name waptrun waptrun 2>&1