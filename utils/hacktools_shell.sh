#!/bin/bash
#========================================================================================
# hacktool_shell.sh: Run shell in the hacktools service.
#========================================================================================
SVC_NAME="hack-tools"

docker-compose exec "$SVC_NAME" /bin/bash
