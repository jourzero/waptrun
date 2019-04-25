// export this module, so that it is accessible to our application modules
module.exports = TestKB;
const config = require("../config.js");
const mongodbUrl = process.env.MONGODB_URL || config.mongodbUrl;
const db = require("monk")(mongodbUrl);

// TestKB constructor
function TestKB() {
    if (!(this instanceof TestKB)) {
        return new TestKB();
    }

    // obtain a reference to our collection within mongodb
    this.testkb = db.get("testkb");
}

// Retrieve a list of all persisted
TestKB.prototype.findAll = function(success, error) {
    this.testkb.find({}, {}, response(success, error));
};

// Retrieve a document by its id
TestKB.prototype.findById = function(id, success, error) {
    console.log("Trying to find by id", id);
    this.testkb.findOne({_id: id}, response(success, error));
};

// Retrieve a document by its Name
// TODO: fix the find query to make it work with the name
TestKB.prototype.findByTID = function(tid, success, error) {
    this.testkb.findOne({TID: tid}, response(success, error));
};

// Persist a new document to mongodb
TestKB.prototype.create = function(doc, success, error) {
    this.testkb.insert(doc, response(success, error));
};

// Update an existing document by id in mongodb
TestKB.prototype.update = function(tid, data, success, error) {
    console.log("Updating", tid, "with", JSON.stringify(data));
    let op = {};
    op["$set"] = data;
    this.testkb.update({TID: tid}, op, response(success, error));
};

// Remove a document by id from the mongodb
TestKB.prototype.removeById = function(id, success, error) {
    this.testkb.remove({_id: id}, response(success, error));
};

// Callback to the supplied success and error functions
// The caller will supply this function. The callers implementation
// will provide the necessary logic. In the case of the sample app,
// the caller's implementation will send an appropriate http response.
let response = function(success, error) {
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
