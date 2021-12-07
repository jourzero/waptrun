#!/bin/bash

# Configure shares between host and container 
HOST_BASE="$PWD"
CTR_BASE="/app"
MOUNTS=""
# Writable
MOUNTS="$MOUNTS -v ${HOST_BASE}/backup:${CTR_BASE}/backup"
MOUNTS="$MOUNTS -v ${HOST_BASE}/data:${CTR_BASE}/data"
MOUNTS="$MOUNTS -v ${HOST_BASE}/.env:${CTR_BASE}/.env"
MOUNTS="$MOUNTS -v ${HOST_BASE}/package.json:${CTR_BASE}/package.json"
MOUNTS="$MOUNTS -v ${HOST_BASE}/package-lock.json:${CTR_BASE}/package-lock.json"
MOUNTS="$MOUNTS -v ${HOST_BASE}/utils:${CTR_BASE}/utils"
#MOUNTS="$MOUNTS -v ${HOST_BASE}/node_modules:${CTR_BASE}/node_modules"
# Read-only
MOUNTS="$MOUNTS -v ${HOST_BASE}/client:${CTR_BASE}/client:ro"
MOUNTS="$MOUNTS -v ${HOST_BASE}/waptrun-static:${CTR_BASE}/waptrun-static:ro"
MOUNTS="$MOUNTS -v ${HOST_BASE}/server:${CTR_BASE}/server:ro"

# Publish specific ports
PUB=""
PUB="${PUB} -p 127.0.0.1:5000:5000"
PUB="${PUB} -p 127.0.0.1:9230:9230"
PUB="${PUB} -p 127.0.0.1:27017:27017"

### Configure run options 
#RUN_OPTS="-it"
RUN_OPTS="-d"

# Run container, mount local dir to /app, name it with the directory name
set -x
docker run ${RUN_OPTS} ${PUB} ${MOUNTS} --name ${PWD##*/} ${PWD##*/} 2>&1