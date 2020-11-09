//=====================================================================
// addIndexes.js: Add missing indexes to MongoDB collections
//
// NOTE: Run this from Mongo shell via: ./mongo.sh /utils/addIndexes.js
//=====================================================================

function addMissingIndex(srcCollection, missingIndex) {
    // Get existing collection
    var srcColl = db.getCollection(srcCollection);

    // Create new destination collection
    var dstCollection = srcCollection + "_new";
    db.createCollection(dstCollection);
    var dstColl = db.getCollection(dstCollection);

    // Get indexes of source collection
    var indexes = srcColl.getIndexes();

    // Copy existing indexes to destination collection
    indexes.forEach(function (index) {
        delete index.v;
        delete index.ns;

        var options = [];
        for (var option in index) {
            if (option != "key") {
                options.push(index["option"]);
            }
        }
        dstColl.createIndex(index.key, options);
    });

    // Add missing index
    srcColl.createIndex(missingIndex, {unique: true});
    dstColl.createIndex(missingIndex, {unique: true});

    // De-duplicate data by copying the source collection data into the destination collection
    //srcColl.copyTo(dstCollection);
    //db.srcColl.aggregate([{$match: {}}, {$out: dstCollection}]);
    db.srcColl.find().forEach(function (docs) {
        db.destColl.insert(docs);
    });

    // Rename source collection
    //srcColl.renameCollection(srcCollection + "_old");

    // Rename the destination (replace the source)
    //dstColl.renameCollection(srcCollection);
}

addMissingIndex("testkb", {TID: 1});
addMissingIndex("cwe", {ID: 1});
addMissingIndex("project", {name: 1});
addMissingIndex("issues", {PrjName: 1, TID: 1});
