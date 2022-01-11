#!/bin/bash

# Check that we're at the root of waptrun project
if [ "${PWD##*/}" != "waptrun" ];then
    echo "ERROR: $0 was not executed from waptrun directory, exiting immediately."
    exit 1
fi

# Stop and remove container
set -x
docker stop waptrun
docker rm waptrun

# Rebuild
docker build --build-arg WAPTRUN_ENV=${WAPTRUN_ENV} --build-arg WAPTRUN_DEV_URL=${WAPTRUN_DEV_URL} --build-arg WAPTRUN_PRD_URL=${WAPTRUN_PRD_URL} -t waptrun .

# Start container
utils/start.sh
utils/tail.sh
