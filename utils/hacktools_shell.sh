#!/bin/bash
#========================================================================================
# hacktool_shell.sh: Run shell in the hacktools service.
#========================================================================================
SVC_NAME="hack-tools"
echo "WARNING: Script $0 is disabled."
exit 0

docker-compose exec "$SVC_NAME" /bin/bash
