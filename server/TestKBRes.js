const testkb = require("./TestKBModel")();
const {validationResult} = require("express-validator/check");
const {matchedData} = require("express-validator/filter");
const logger = require("../lib/appLogger.js");

exports.findAll = function(req, res) {
    // Check for input validation errors in the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn(`Input validation failed: ${JSON.stringify(errors)}`);
        return res.status(422).json({errors: errors.array()});
    }
    let ok = function(doc) {
        logger.info("Successful DB search.");
        res.json(doc);
    };
    let err = function(err) {
        logger.warn(`Failed DB search: ${JSON.stringify(err)}`);
        res.sendStatus(404);
    };
    testkb.findAll(ok, err);
};

exports.findByTID = function(req, res) {
    // Check for input validation errors in the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn(`Input validation failed: ${JSON.stringify(errors)}`);
        return res.status(422).json({errors: errors.array()});
    }
    let ok = function(doc) {
        logger.info("Successful DB search.");
        res.json(doc);
    };
    let err = function(err) {
        logger.warn(`Failed DB search: ${JSON.stringify(err)}`);
        res.sendStatus(404);
    };
    testkb.findByTID(req.params.TID, ok, err);
};

exports.create = function(req, res) {
    // Check for input validation errors in the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn(`Input validation failed: ${JSON.stringify(errors)}`);
        return res.status(422).json({errors: errors.array()});
    }

    // Use the filter API of express-validator to only include the fields included in the schema
    const bodyData = matchedData(req, {
        includeOptionals: true,
        onlyValidData: true,
        locations: ["body"]
    });

    let ok = function(doc) {
        logger.info("Successful DB create.");
        res.location("/api/testkb/doc.TID");
        res.status(201)
            .json(bodyData)
            .send();
    };

    let err = function(err) {
        logger.warn(`Failed DB create: ${JSON.stringify(err)}`);
        res.send(409, "Failed to create object");
    };

    testkb.create(bodyData, ok, err);
};

exports.update = function(req, res) {
    // Check for input validation errors in the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn(`Input validation failed: ${JSON.stringify(errors)}`);
        return res.status(422).json({errors: errors.array()});
    }

    // Use the filter API of express-validator to only include the fields included in the schema
    const bodyData = matchedData(req, {
        includeOptionals: true,
        onlyValidData: true,
        locations: ["body"]
    });

    let ok = function(doc) {
        logger.info("Successful DB update.");
        res.sendStatus(200);
    };
    let err = function(err) {
        logger.warn(`Failed DB update: ${JSON.stringify(err)}`);
        res.send(409, "update failed");
    };
    testkb.update(req.params.TID, bodyData, ok, err);
};
