#!/bin/bash
#========================================================================================
# waptrdb_shell.sh: Run shell in the waptrdb container (where our mongoDB is).
#========================================================================================
CONTAINER_NAME="waptrdb"

docker exec -it "$CONTAINER_NAME" /bin/bash
