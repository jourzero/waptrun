#!/bin/bash

# Start Mongo DB
#echo -e "\n\n-- Starting Mongo DB..."
#service mongod start

# Get app dependencies
#echo -e "\n\n-- Installing node modules"
#su node -c "npm install"

# Run app as lower privileged user
echo -e "\n\n-- Starting app"
#su node -c "npm run dev"
npm run dev