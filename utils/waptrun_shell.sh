#!/bin/bash
#========================================================================================
# waptr_shell.sh: Run shell in the waptr container (where our main app is).
#========================================================================================
SVC_NAME="app"

docker-compose exec "$SVC_NAME" /bin/bash
