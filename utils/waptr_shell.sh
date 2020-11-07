#!/bin/bash
#========================================================================================
# waptr_shell.sh: Run shell in the waptr container (where our main app is).
#========================================================================================
CONTAINER_NAME="waptr"

docker exec -it "$CONTAINER_NAME" /bin/bash
