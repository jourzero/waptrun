const projects = require("./ProjectModel")();
//const { validationResult } = require("express-validator/check");
//const { matchedData } = require("express-validator/filter");
const {validationResult, matchedData} = require("express-validator");
const logger = require("../lib/appLogger.js");

exports.findAll = function (req, res) {
    // Check for input validation errors in the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn(`Input validation failed: ${JSON.stringify(errors)}`);
        return res.status(422).json({errors: errors.array()});
    }
    let ok = function (doc) {
        logger.info("Successful search for all projects");
        res.json(doc);
    };
    let err = function (err) {
        logger.warn(`Failed project search: ${JSON.stringify(err)}`);
        res.sendStatus(404);
    };
    logger.info("Searching for all projects");
    projects.findAll(ok, err);
};

exports.findByName = function (req, res) {
    // Check for input validation errors in the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn(`Input validation failed: ${JSON.stringify(errors)}`);
        return res.status(422).json({errors: errors.array()});
    }
    let ok = function (doc) {
        logger.info("Successful search by name");
        res.json(doc);
    };
    let err = function (err) {
        logger.warn(`Failed project search by name: ${JSON.stringify(err)}`);
        res.sendStatus(404);
    };
    logger.info(`Searching for project name ${req.params.name}`);
    projects.findByName(req.params.name, ok, err);
};

exports.create = function (req, res) {
    // Check for input validation errors in the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn(`Input validation failed: ${JSON.stringify(errors)}`);
        return res.status(422).json({errors: errors.array()});
    }

    // Use the filter API of express-validator to only include the fields included in the schema
    const bodyData = matchedData(req, {
        includeOptionals: false,
        onlyValidData: true,
        locations: ["body"],
    });

    let ok = function (doc) {
        logger.info("Successful project creation");
        res.location("/projects/doc._id");
        res.sendStatus(201);
    };
    let err = function (err) {
        logger.warn(`Failed project creation: ${JSON.stringify(err)}`);
        res.sendStatus(409);
    };
    logger.info(`Creating project: ${JSON.stringify(bodyData)}`);
    projects.create(bodyData, ok, err);
};

exports.update = function (req, res) {
    // Check for input validation errors in the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn(`Input validation failed: ${JSON.stringify(errors)}`);
        return res.status(422).json({errors: errors.array()});
    }

    const bodyData = matchedData(req, {
        includeOptionals: false,
        onlyValidData: true,
        locations: ["body"],
    });

    let ok = function (doc) {
        logger.info("Successful project update");
        res.sendStatus(200);
    };
    let err = function (err) {
        logger.warn(`Failed project update: ${JSON.stringify(err)}`);
        res.sendStatus(409);
    };
    logger.info(`Updating project ${req.params.name} with: ${JSON.stringify(bodyData)}`);
    projects.update(req.params.name, bodyData, ok, err);
};

exports.removeByName = function (req, res) {
    // Check for input validation errors in the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn(`Input validation failed: ${JSON.stringify(errors)}`);
        return res.status(422).json({errors: errors.array()});
    }
    let ok = function (doc) {
        logger.info("Successful project removal by name");
        res.sendStatus(200);
    };
    let err = function (err) {
        logger.warn(`Failed project removal by name: ${JSON.stringify(err)}`);
        res.send(409, "Failed to remove object");
    };
    logger.info("Removing project req.params.name");
    projects.removeByName(req.params.name, ok, err);
};
