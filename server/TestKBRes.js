const testkb = require("./TestKBModel")();
const {validationResult} = require("express-validator/check");
const {matchedData} = require("express-validator/filter");

exports.findAll = function(req, res) {
    // Check for input validation errors in the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }
    let ok = function(doc) {
        res.json(doc);
    };
    let err = function(err) {
        res.sendStatus(404);
    };
    testkb.findAll(ok, err);
};

exports.findByName = function(req, res) {
    // Check for input validation errors in the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }
    let ok = function(doc) {
        res.json(doc);
    };
    let err = function(err) {
        res.sendStatus(404);
    };
    testkb.findByName(req.params.TTestName, ok, err);
};

exports.findByTID = function(req, res) {
    // Check for input validation errors in the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }
    let ok = function(doc) {
        res.json(doc);
    };
    let err = function(err) {
        res.sendStatus(404);
    };
    testkb.findByTID(req.params.TID, ok, err);
};

exports.create = function(req, res) {
    // Check for input validation errors in the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }

    // Use the filter API of express-validator to only include the fields included in the schema
    const bodyData = matchedData(req, {
        includeOptionals: true,
        onlyValidData: true,
        locations: ["body"]
    });

    let ok = function(doc) {
        res.location("/api/testkb/doc.TID");
        res.status(201)
            .json(bodyData)
            .send();
    };

    let err = function(err) {
        res.send(409, "Failed to create object");
    };

    testkb.create(bodyData, ok, err);
};

exports.update = function(req, res) {
    // Check for input validation errors in the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }

    // Use the filter API of express-validator to only include the fields included in the schema
    const bodyData = matchedData(req, {
        includeOptionals: true,
        onlyValidData: true,
        locations: ["body"]
    });

    let ok = function(doc) {
        res.sendStatus(200);
    };
    let err = function(err) {
        res.send(409, "update failed");
    };
    testkb.update(req.params.TID, bodyData, ok, err);
    //}
};

/*
exports.removeById = function(req, res) {
    // Check for input validation errors in the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }
    if (!req.body._id) {
        res.send(404, "id required");
    } else {
        let ok = function(doc) {
            res.sendStatus(200);
        };
        let err = function(err) {
            res.send(409, "Failed to remove object");
        };
        testkb.removeById(req.params._id, ok, err);
    }
};
*/

/*
exports.findById = function(req, res) {
    // Check for input validation errors in the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }
    let ok = function(doc) {
        res.json(doc);
    };
    let err = function(err) {
        res.sendStatus(404);
    };
    testkb.findById(req.params.id, ok, err);
};
*/
