#!/bin/bash

# Configure shares between host and container 
HOST_BASE="$PWD"
CTR_BASE="/app"
MOUNTS=""

# Writable shares (applicable in Dev & Prod)
# Share for DB backups
MOUNTS="$MOUNTS -v ${HOST_BASE}/backup:${CTR_BASE}/backup"
# Share for live environment changes
MOUNTS="$MOUNTS -v ${HOST_BASE}/.env:${CTR_BASE}/.env"

# Read-only shares: static reference content
MOUNTS="$MOUNTS -v ${HOST_BASE}/waptrun-static:${CTR_BASE}/waptrun-static:ro"

# Writable shares for Prod only -- i.e. Prod gets updated via in-container 'git pull' so we share GIT data with the container
if [ "$WAPTRUN_ENV" = PROD ];then 
    MOUNTS="$MOUNTS -v ${HOST_BASE}/.git:${CTR_BASE}/.git"

# Writable shares for Dev/QA
else
    # Simplify bidirectional data file updates between Dev host and Dev Container
    MOUNTS="$MOUNTS -v ${HOST_BASE}/data:${CTR_BASE}/data"
    # Bring dependency updates back to Dev for Github pushes
    MOUNTS="$MOUNTS -v ${HOST_BASE}/package.json:${CTR_BASE}/package.json"
    MOUNTS="$MOUNTS -v ${HOST_BASE}/package-lock.json:${CTR_BASE}/package-lock.json"
    # Allow edits from IDE and immediate effects in Dev container
    MOUNTS="$MOUNTS -v ${HOST_BASE}/utils:${CTR_BASE}/utils"
    MOUNTS="$MOUNTS -v ${HOST_BASE}/client:${CTR_BASE}/client"
    MOUNTS="$MOUNTS -v ${HOST_BASE}/server:${CTR_BASE}/server"
    # Only uncomment below line sporadically to help with IDE code completion (after new modules are added)
    #MOUNTS="$MOUNTS -v ${HOST_BASE}/node_modules:${CTR_BASE}/node_modules"
fi



# Publish specific ports
PUB=""
PUB="${PUB} -p 127.0.0.1:5000:5000"
PUB="${PUB} -p 127.0.0.1:9230:9230"
PUB="${PUB} -p 127.0.0.1:27017:27017"

### Configure run options 
RUN_OPTS="-d -u $(id -u):$(id -g)"

# Run container, mount local dir to /app, name it with the directory name
set -x
docker run ${RUN_OPTS} ${PUB} ${MOUNTS} --name ${PWD##*/} ${PWD##*/} 2>&1