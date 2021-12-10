#!/bin/bash

# Check that we're at the root of waptrun project
if [ "$(basename ${PWD})" != "waptrun" ];then
    echo "ERROR: $0 was not executed from waptrun directory, exiting immediately."
    exit 1
fi

# Stop and remove container
set -x
docker stop waptrun
docker rm waptrun

# Rebuild
docker build -t waptrun waptrun

# Start container
utils/start.sh
utils/tail.sh
