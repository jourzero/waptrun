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
docker restart ${PWD##*/} 2>&1
docker logs -f ${PWD##*/} 