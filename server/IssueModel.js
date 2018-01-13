// export this module, so that it is accessible to our application modules
module.exports = Issue;
var config = require('../config.js'); 
var mongodbUrl = process.env.MONGODB_URL || config.mongodbUrl;

 
// Issue constructor
function Issue() {
        if (!(this instanceof Issue)) {
                return new Issue();
        }
 
        // require mongodb
        var mongo = require('mongodb');
        // Connect to our mongodb running on localhost and named 'test'
        var db = require('monk')(mongodbUrl);
        // obtain a reference to our collection within mongodb
        this.issue = db.get('issues');
};
 
// Retrieve a list of all persisted
Issue.prototype.findAll = function(success, error) {
    this.issue.find({},{},response(success, error));
};
 
// Retrieve a document by its id
Issue.prototype.findById = function(id, success, error) {
    console.log("Trying to find by id", id);
    this.issue.findOne({_id: id}, response(success,error));
};
 
 
// Retrieve a document by its Name
// TODO: fix the find query to make it work with the name
Issue.prototype.findIssue = function(prjName, tid, success, error) {
    // Build search criteria
    var crit={}; var kvp1 = {}; var kvp2 = {};
    kvp1.TID = tid;
    kvp2.PrjName = prjName;
    crit["$and"] = [kvp1, kvp2];
    this.issue.findOne(crit, response(success,error));
};


// Retrieve a document by its Name
Issue.prototype.findProjectIssues = function(prjName, success, error) {
    this.issue.find({PrjName: prjName},{sort: {IPriority: -1, TIssueName: 1}}, response(success, error));
};
 

/* Unused
// Persist a new document to mongodb
Issue.prototype.create = function(doc, success, error) {
    this.issue.insert(doc, response(success,error));
};
*/
 
// Update an existing document by id in mongodb
Issue.prototype.upsert = function(prjName, tid, data, success, error) {
    // Build search criteria
    var crit={}; var kvp1 = {}; var kvp2 = {};
    kvp1.TID = tid;
    kvp2.PrjName = prjName;
    crit["$and"] = [kvp1, kvp2];
    options = { upsert: true };
    
    console.log("Updating", JSON.stringify(crit), "with", JSON.stringify(data));
    this.issue.update(crit, data, options, response(success, error));
};
 
/* Unused
// Remove a document by id from the mongodb
Issue.prototype.removeById = function(id, success, error) {
    this.issue.remove({_id : id}, response(success, error));
};
*/

// Remove a document by name from the mongodb
Issue.prototype.removeByName = function(prjName, tid, success, error) {
    var crit={}; var kvp1 = {}; var kvp2 = {};
    kvp1.TID = tid;
    kvp2.PrjName = prjName;
    crit["$and"] = [kvp1, kvp2];
    
    this.issue.remove(crit, response(success, error));
};


// Remove a document by name from the mongodb
Issue.prototype.removeAllForPrj = function(prjName, success, error) {
    var kvp = {};
    kvp.PrjName = prjName;
    
    this.issue.remove(kvp, response(success, error));
};
// Callback to the supplied success and error functions
// The caller will supply this function. The callers implementation
// will provide the necessary logic. In the case of the sample app,
// the caller's implementation will send an appropriate http response.
var response = function(success, error) {
    return function(err, doc) {
        if (err) {
            // an error occurred, call the supplied error function
            error(err);
        } else {
            // call the supplied success function
            success(doc);
        }
    };
};