#!/bin/bash
#===============================================
# Create JNDI attack payloads from variables
#===============================================
PAYLOAD_FILE=jndi.txt

# Load variables and payloads 
. ./VARS.sh
. ./PAYLOADS.sh

# Generate the payload file
for i in $(seq 1 $NUM_PAYLOADS);do
    payload="${PAYLOAD[$i]}"
    echo "${payload}" 
done > ${PAYLOAD_FILE}