#!/bin/bash
set -x

# Stop and remove container
docker stop ${PWD##*/} 
docker rm ${PWD##*/} 

# Rebuild
docker-build.sh

# Start container
./start.sh
