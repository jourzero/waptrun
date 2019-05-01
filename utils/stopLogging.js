//=====================================================================
// stopLoggin.js: Stop logging MongoDB commands.
//
// NOTE: Run this from Mongo shell via: ./mongo.sh /utils/stopLogging.js
//=====================================================================

db.setLogLevel(-1,"command")
