// export this module, so that it is accessible to our application modules
module.exports = Issue;

const config = require("../config.js");
const mongodbUrl = process.env.MONGODB_URL || config.mongodbUrl;
const db = require("monk")(mongodbUrl);

// Issue constructor
function Issue() {
    if (!(this instanceof Issue)) {
        return new Issue();
    }

    // obtain a reference to our collection within mongodb
    this.issue = db.get("issues");
}

// Retrieve a list of all persisted
Issue.prototype.findAll = function(success, error) {
    this.issue.find({}, {}, response(success, error));
};

// Retrieve a document by its id
Issue.prototype.findById = function(id, success, error) {
    this.issue.findOne({_id: id}, response(success, error));
};

// Retrieve a document by its Name
// TODO: fix the find query to make it work with the name
Issue.prototype.findIssue = function(PrjName, TID, success, error) {
    // Build search criteria
    let crit = {},
        kvp1 = {},
        kvp2 = {};
    kvp1.TID = TID;
    kvp2.PrjName = PrjName;
    crit["$and"] = [kvp1, kvp2];
    this.issue.findOne(crit, response(success, error));
};

// Retrieve a document by its Name
Issue.prototype.findProjectIssues = function(PrjName, success, error) {
    this.issue.find(
        {PrjName: PrjName},
        {sort: {IPriority: -1, TIssueName: 1}},
        response(success, error)
    );
};

// Update an existing document by id in mongodb
Issue.prototype.upsert = function(PrjName, TID, data, success, error) {
    // Build search criteria
    const options = {upsert: true};
    let op = {},
        crit = {},
        kvp1 = {},
        kvp2 = {};
    kvp1.TID = TID;
    kvp2.PrjName = PrjName;
    crit["$and"] = [kvp1, kvp2];
    op["$set"] = data;

    this.issue.update(crit, op, options, response(success, error));
};

// Remove a document by name from the mongodb
Issue.prototype.removeByName = function(PrjName, TID, success, error) {
    let crit = {},
        kvp1 = {},
        kvp2 = {};
    kvp1.TID = TID;
    kvp2.PrjName = PrjName;
    crit["$and"] = [kvp1, kvp2];

    this.issue.remove(crit, response(success, error));
};

// Remove a document by name from the mongodb
Issue.prototype.removeAllForPrj = function(PrjName, success, error) {
    let kvp = {};
    kvp.PrjName = PrjName;

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
