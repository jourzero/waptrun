//============================================================================
// createCweColl.js: Create CWE collection and add index
//
// NOTE: Run this from Mongo shell via: ./mongo.sh /app/utils/createCweColl.js
//============================================================================
var collName = "cwe";
var cweIndex = {ID: 1};

// Get collection (if exists) and drop it
var coll = db.getCollection(collName);
coll.drop();

// Create collection
db.createCollection(collName);

// Get collection
coll = db.getCollection(collName);

// Add index
coll.createIndex(cweIndex, {unique: true});
