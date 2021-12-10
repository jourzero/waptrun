#!/bin/bash
echo "WARNING: Script $0 is disabled."
exit 0
ZIPFILE="target/waptrun.zip"
PRJHOME="$HOME/github/waptrun"
cd "$PRJHOME"
if [ "$PWD" != "$PRJHOME" ];then
    echo "ERROR: Could not find the project home. Skipping zip file prep."
    exit 1
fi
mv "$ZIPFILE" "${ZIPFILE}.prev"
zip -r "$ZIPFILE" client server views