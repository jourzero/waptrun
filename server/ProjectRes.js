var projects = require('./ProjectModel')();
 
exports.findAll = function(req, res) {
    var ok = function(doc) {
        res.json(doc);
    };
    var err = function(err) {
        res.send(404);
    };
    projects.findAll(ok, err);
};
 
exports.findById = function(req, res) {
    var ok = function(doc) {
        res.json(doc);
    };
    var err = function(err) {
        //res.send(404);
        res.status(404).send('Sorry, we cannot find that!');
    };
    projects.findById(req.params.id, ok, err);
};

exports.findByName = function(req, res) {
    var ok = function(doc) {
        res.json(doc);
    };
    var err = function(err) {
        //res.send(404);
        res.status(404).send('Sorry, we cannot find that!');
    };
    projects.findByName(req.params.name, ok, err);
};

exports.create = function(req, res) {
    var ok = function(doc) {
        res.location('/projects/doc._id');
        res.send(201);
    };
    var err = function(err) {
        res.send(409, "Failed to create object");
    };
    projects.create(req.body, ok, err);
};
 
exports.update = function(req, res) {
    //if (!req.body._id) {
    //        res.send(404, "id required");
    //} else {
        var ok = function(doc) {
            res.send(200);
        };
        var err = function(err) {
            res.send(409, "update failed");
        };
        projects.update(req.params.name, req.body, ok, err);
    //}
};
 
exports.removeById = function(req, res) {
    if (!req.body._id) {
        res.send(404, "id required");
    } else {
        var ok = function(doc) {
            res.send(200);
        };
        var err = function(err) {
            res.send(409, "Failed to remove object");
        };
        projects.removeById(req.params.id, ok, err);
    }
};
        
                