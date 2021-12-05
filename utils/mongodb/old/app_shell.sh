#!/bin/bash
#========================================================================================
# app_shell.sh: Run shell in the app container (where our main app is).
#========================================================================================
SVC_NAME="waptrun"

docker-compose exec "$SVC_NAME" /bin/bash
