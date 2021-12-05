//=======================================================================
// startLogging.js: Log MongoDB commands to view queries being sent.
//
// NOTE: Run this from Mongo shell via: ./mongo.sh /utils/startLogging.js
//=======================================================================

db.setLogLevel(0);
db.setLogLevel(1,"command");
