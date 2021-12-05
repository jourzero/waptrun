#!/bin/bash
#========================================================================================
# waptrdb_shell.sh: Run shell in the waptrdb container (where our mongoDB is).
#========================================================================================
SVC_NAME="waptrdb"

docker-compose exec "$SVC_NAME" /bin/bash
