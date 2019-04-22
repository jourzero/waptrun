// export this module, so that it is accessible to our application modules
module.exports = Projects;
var config = require("../config.js");
var mongodbUrl = process.env.MONGODB_URL || config.mongodbUrl;

// Projects constructor
function Projects() {
    if (!(this instanceof Projects)) {
        return new Projects();
    }

    // Connect to our mongodb running on localhost and named 'test'
    var db = require("monk")(mongodbUrl);
    // obtain a reference to our projects collection within mongodb
    this.projects = db.get("project");
}

// Retrieve a list of all persisted
Projects.prototype.findAll = function(success, error) {
    this.projects.find({}, {}, response(success, error));
};

// Retrieve a project by its id
Projects.prototype.findById = function(id, success, error) {
    console.log("Trying to find by id", id);
    this.projects.findOne({_id: id}, response(success, error));
};

// Retrieve a project by its Name
// TODO: fix the find query to make it work with the name
Projects.prototype.findByName = function(prjName, success, error) {
    this.projects.findOne({name: prjName}, response(success, error));
};

// Persist a new project document to mongodb
Projects.prototype.create = function(project, success, error) {
    this.projects.insert(project, response(success, error));
};

// Update an existing project document by id in mongodb
Projects.prototype.update = function(prjName, data, success, error) {
    console.log("Updating", prjName, "with", JSON.stringify(data));

    this.projects.update({name: prjName}, data, response(success, error));
};

// Remove a project by id from the mongodb
Projects.prototype.removeById = function(id, success, error) {
    this.projects.remove({_id: id}, response(success, error));
};

// Remove a project by name from the mongodb
Projects.prototype.removeByName = function(prjName, success, error) {
    this.projects.remove({name: prjName}, response(success, error));
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
