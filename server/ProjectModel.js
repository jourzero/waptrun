// export this module, so that it is accessible to our application modules
module.exports = Projects;
const config = require("../config.js");
const mongodbUrl = process.env.MONGODB_URL || config.mongodbUrl;
const db = require("monk")(mongodbUrl);
const logger = require("../lib/appLogger.js");

// Projects constructor
function Projects() {
    if (!(this instanceof Projects)) {
        return new Projects();
    }

    // obtain a reference to our projects collection within mongodb
    this.projects = db.get("project");
}

// Retrieve a list of all persisted
Projects.prototype.findAll = function (success, error) {
    this.projects.find({}, {}, response(success, error));
};

// Retrieve a project by its id
Projects.prototype.findById = function (id, success, error) {
    this.projects.findOne({_id: id}, response(success, error));
};

// Retrieve a project by its Name
// TODO: fix the find query to make it work with the name
Projects.prototype.findByName = function (name, success, error) {
    this.projects.findOne({name: name}, response(success, error));
};

// Persist a new project document to mongodb
Projects.prototype.create = function (project, success, error) {
    this.projects.insert(project, response(success, error));
};

// Update an existing project document by id in mongodb
Projects.prototype.update = function (name, data, success, error) {
    logger.debug(`Updating project collection ${name} with data: ${JSON.stringify(data)}`);
    this.projects.update({name: name}, {$set: data}, response(success, error));
};

// Remove a project by id from the mongodb
Projects.prototype.removeById = function (id, success, error) {
    this.projects.remove({_id: id}, response(success, error));
};

// Remove a project by name from the mongodb
Projects.prototype.removeByName = function (name, success, error) {
    this.projects.remove({name: name}, response(success, error));
};

// Callback to the supplied success and error functions
// The caller will supply this function. The callers implementation
// will provide the necessary logic. In the case of the sample app,
// the caller's implementation will send an appropriate http response.
let response = function (success, error) {
    return function (err, doc) {
        if (err) {
            // an error occurred, call the supplied error function
            error(err);
        } else {
            // call the supplied success function
            success(doc);
        }
    };
};
