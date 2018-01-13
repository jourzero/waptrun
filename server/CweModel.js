// export this module, so that it is accessible to our application modules
module.exports = CWE;
var config = require('../config.js'); 
var mongodbUrl = process.env.MONGODB_URL || config.mongodbUrl;

 
// CWE constructor
function CWE() {
        if (!(this instanceof CWE)) {
                return new CWE();
        }
 
        // require mongodb
        var mongo = require('mongodb');
        // Connect to our mongodb running on localhost and named 'test'
        var db = require('monk')(mongodbUrl);
        // obtain a reference to our cwe collection within mongodb
        this.cwe = db.get('cwe');
};
 
// Retrieve a list of all persisted
CWE.prototype.findAll = function(success, error) {
    this.cwe.find({},{},response(success, error));
};
 
// Retrieve a cwe by its id
CWE.prototype.findById = function(id, success, error) {
    console.log("Trying to find by id", id);
    this.cwe.findOne({ID: parseInt(id)}, response(success,error));
};
 
// Retrieve a cwe by its Name
// TODO: fix the find query to make it work with the name
CWE.prototype.findByName = function(cweName, success, error) {
    this.cwe.findOne({Name: cweName}, response(success,error));
};
 
// Persist a new cwe document to mongodb
CWE.prototype.create = function(cwe, success, error) {
    this.cwe.insert(cwe, response(success,error));
};
 
// Update an existing cwe document by id in mongodb
CWE.prototype.update = function(cweID, data, success, error) {
    console.log("Updating", cweID, "with", JSON.stringify(data));

    //this.cwe.findAndModify(cwe._id, { $set: { name: cwe.name } }, response(success, error));
    //this.cwe.findOneAndUpdate({name:prjName}, data, response(success, error));
    this.cwe.update({ID:cweID}, data, response(success, error));
};
 
// Remove a cwe by id from the mongodb
CWE.prototype.removeById = function(id, success, error) {
    this.cwe.remove({_id : id}, response(success, error));
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