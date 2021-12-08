#!/bin/bash
# Update app code from Github
cd /app
git config pull.ff only 
git pull https://github.com/jourzero/waptrun.git