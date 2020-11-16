//=========================================================================
// addIndexes.js: Add missing indexes to MongoDB collections
//
// NOTE: Run this from Mongo shell via: ./mongo.sh /app/utils/addIndexes.js
//=========================================================================

function addMissingIndex(collName, missingIndex) {
    // Get collection
    var coll = db.getCollection(collName);

    // Add missing index
    coll.createIndex(missingIndex, {unique: true});
}

addMissingIndex("testkb", {TID: 1});
addMissingIndex("cwe", {ID: 1});
addMissingIndex("project", {name: 1});
addMissingIndex("issues", {PrjName: 1, TID: 1});
