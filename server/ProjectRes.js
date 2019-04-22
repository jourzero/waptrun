var projects = require("./ProjectModel")();
const {validationResult} = require("express-validator/check");

exports.findAll = function(req, res) {
    // Check for input validation errors in the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }
    var ok = function(doc) {
        res.json(doc);
    };
    var err = function(err) {
        res.sendStatus(404);
    };
    projects.findAll(ok, err);
};

exports.findById = function(req, res) {
    // Check for input validation errors in the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }
    var ok = function(doc) {
        res.json(doc);
    };
    var err = function(err) {
        res.sendStatus(404);
    };
    projects.findById(req.params.id, ok, err);
};

exports.findByName = function(req, res) {
    // Check for input validation errors in the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }
    var ok = function(doc) {
        res.json(doc);
    };
    var err = function(err) {
        res.sendStatus(404);
    };
    projects.findByName(req.params.prjName, ok, err);
};

exports.create = function(req, res) {
    // Check for input validation errors in the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }
    var ok = function(doc) {
        res.location("/projects/doc._id");
        res.sendStatus(201);
    };
    var err = function(err) {
        res.sendStatus(409);
    };
    projects.create(req.body, ok, err);
};

exports.update = function(req, res) {
    // Check for input validation errors in the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }
    //if (!req.body._id) {
    //        res.send(404, "id required");
    //} else {
    var ok = function(doc) {
        res.sendStatus(200);
    };
    var err = function(err) {
        res.sendStatus(409);
    };
    projects.update(req.params.prjName, req.body, ok, err);
    //}
};

exports.removeById = function(req, res) {
    // Check for input validation errors in the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }
    if (!req.body._id) {
        res.send(404, "id required");
    } else {
        var ok = function(doc) {
            res.sendStatus(200);
        };
        var err = function(err) {
            res.send(409, "Failed to remove object");
        };
        projects.removeById(req.params.id, ok, err);
    }
};

exports.removeByName = function(req, res) {
    // Check for input validation errors in the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }
    //if (!req.body._id) {
    //    res.send(404, "id required");
    //} else {
    var ok = function(doc) {
        res.sendStatus(200);
    };
    var err = function(err) {
        res.send(409, "Failed to remove object");
    };
    projects.removeByName(req.params.prjName, ok, err);
    //}
};
