#!/bin/bash
echo "WARNING: Script $0 is disabled."
exit 0
OUTPUT_DIR="/app/data"
INPUT_FILE="1344.xml"
OUTPUT_FILE="cwe-top10s.csv"
XSL_FILE="/app/utils/cwe.xsl"

xsltproc -o ${OUTPUT_DIR}/${OUTPUT_FILE} ${XSL_FILE} ${OUTPUT_DIR}/${INPUT_FILE}
