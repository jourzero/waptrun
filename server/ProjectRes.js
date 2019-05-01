const projects = require("./ProjectModel")();
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
        logger.info("Successful DB search");
        res.json(doc);
    };
    let err = function(err) {
        logger.warn(`Failed DB search: ${JSON.stringify(err)}`);
        res.sendStatus(404);
    };
    projects.findAll(ok, err);
};

exports.findByName = function(req, res) {
    // Check for input validation errors in the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn(`Input validation failed: ${JSON.stringify(errors)}`);
        return res.status(422).json({errors: errors.array()});
    }
    let ok = function(doc) {
        logger.info("Successful DB search");
        res.json(doc);
    };
    let err = function(err) {
        logger.warn(`Failed DB search: ${JSON.stringify(err)}`);
        res.sendStatus(404);
    };
    projects.findByName(req.params.name, ok, err);
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
        logger.info("Successful DB creation");
        res.location("/projects/doc._id");
        res.sendStatus(201);
    };
    let err = function(err) {
        logger.warn(`Failed DB create: ${JSON.stringify(err)}`);
        res.sendStatus(409);
    };
    projects.create(bodyData, ok, err);
};

exports.update = function(req, res) {
    // Check for input validation errors in the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn(`Input validation failed: ${JSON.stringify(errors)}`);
        return res.status(422).json({errors: errors.array()});
    }

    const bodyData = matchedData(req, {
        includeOptionals: true,
        onlyValidData: true,
        locations: ["body"]
    });

    let ok = function(doc) {
        logger.info("Successful DB update");
        res.sendStatus(200);
    };
    let err = function(err) {
        logger.warn(`Failed DB update: ${JSON.stringify(err)}`);
        res.sendStatus(409);
    };
    projects.update(req.params.name, bodyData, ok, err);
};

exports.removeByName = function(req, res) {
    // Check for input validation errors in the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn(`Input validation failed: ${JSON.stringify(errors)}`);
        return res.status(422).json({errors: errors.array()});
    }
    let ok = function(doc) {
        logger.info("Successful DB removal");
        res.sendStatus(200);
    };
    let err = function(err) {
        logger.warn(`Failed DB remove: ${JSON.stringify(err)}`);
        res.send(409, "Failed to remove object");
    };
    projects.removeByName(req.params.name, ok, err);
    //}
};
