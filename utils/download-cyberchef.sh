#!/bin/bash
set -x
VERSION="CyberChef_v9.21.0"
ZIP_FILE="${VERSION}.zip"
URI="https://gchq.github.io/CyberChef/${ZIP_FILE}"
if [ -f "$ZIP_FILE" ];then
    echo "NOTE: $ZIP_FILE is already here, skipping download."
else
    echo "Downloading $ZIP_FILE..."
    curl -o "$ZIP_FILE" "$URI"
fi
mkdir cyberchef
cd cyberchef
unzip "../${ZIP_FILE}"
ln -s "${VERSION}.html" index.html
cd ..
mv cyberchef ../static