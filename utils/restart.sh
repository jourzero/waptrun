#!/bin/bash
set -x

# Restart container and tail logs
docker restart ${PWD##*/} 2>&1
docker logs -f ${PWD##*/} 