#!/bin/bash
HOST_SHARE="$PWD"
CTR_SHARE="/app"

# Publish specific ports
PUB=""
PUB="$PUB -p 127.0.0.1:5000:5000"
PUB="$PUB -p 127.0.0.1:9230:9230"
PUB="$PUB -p 127.0.0.1:27017:27017"

# Run container, mount local dir to /app, name it with the directory name
set -x
docker run -d -it $PUB --mount "type=bind,source=${HOST_SHARE},target=${CTR_SHARE}" $OPTS --name ${PWD##*/} ${PWD##*/} 
