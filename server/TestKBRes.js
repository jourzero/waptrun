var testkb = require("./TestKBModel")();
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
    testkb.findAll(ok, err);
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
    testkb.findById(req.params.id, ok, err);
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
    testkb.findByName(req.params.name, ok, err);
};

exports.findByTID = function(req, res) {
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
    testkb.findByTID(req.params.tid, ok, err);
};

exports.create = function(req, res) {
    // Check for input validation errors in the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }
    var ok = function(doc) {
        res.location("/api/testkb/doc.TID");
        res.sendStatus(201);
    };
    var err = function(err) {
        res.send(409, "Failed to create object");
    };
    testkb.create(req.body, ok, err);
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
        res.send(409, "update failed");
    };
    testkb.update(req.params.tid, req.body, ok, err);
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
        testkb.removeById(req.params.id, ok, err);
    }
};
