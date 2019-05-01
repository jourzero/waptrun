const issue = require("./IssueModel")();
const {validationResult} = require("express-validator/check");
const {matchedData} = require("express-validator/filter");
const logger = require("../lib/appLogger.js");

// Find all issues in all projects (routes: /api/issue, /issues.csv)
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
        res.send(404);
    };
    issue.findAll(ok, err);
};

// Find an issue by project name and test ID (route: /api/issue/:PrjName/:TID)
exports.findIssue = function(req, res) {
    // Check for input validation errors in the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn(`Input validation failed: ${JSON.stringify(errors)}`);
        return res.status(422).json({errors: errors.array()});
    }
    let ok = function(doc) {
        logger.info("Succeeded with DB search");
        res.json(doc);
    };
    let err = function(err) {
        //res.send(404);
        logger.warn(`Failed DB search: ${JSON.stringify(err)}`);
        res.sendStatus(404);
    };
    issue.findIssue(req.params.PrjName, req.params.TID, ok, err);
};

// Find all issues for a project (routes: /api/issue/:PrjName, /export/csv/:PrjName, /export/html/:PrjName)
exports.findProjectIssues = function(req, res) {
    // Check for input validation errors in the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn(`Input validation failed: ${JSON.stringify(errors)}`);
        return res.status(422).json({errors: errors.array()});
    }
    let ok = function(doc) {
        logger.info("Succeeded with DB search");
        res.json(doc);
    };
    let err = function(err) {
        logger.warn(`Failed DB search: ${JSON.stringify(err)}`);
        res.sendStatus(404);
    };
    issue.findIssue(req.params.PrjName, ok, err);
};

// Upsert an issue (route: /api/issue/:PrjName/:TID)
exports.upsert = function(req, res) {
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
        logger.info("Successful upsert completed");
        res.sendStatus(200);
    };
    let err = function(err) {
        logger.warn(`Issue upsert failed: ${JSON.stringify(err)}`);
        res.send(409, "update failed");
    };
    issue.upsert(req.params.PrjName, req.params.TID, bodyData, ok, err);
};

// Remove an issue by name (route: /api/issue/:PrjName/:TID)
exports.removeByName = function(req, res) {
    // Check for input validation errors in the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn(`Input validation failed: ${JSON.stringify(errors)}`);
        return res.status(422).json({errors: errors.array()});
    }

    let ok = function(doc) {
        logger.info("Successful delete completed");
        res.sendStatus(200);
    };
    let err = function(err) {
        logger.warn(`Delete failed: ${JSON.stringify(err)}`);
        res.send(409, "Failed to remove object");
    };
    issue.removeByName(req.params.PrjName, req.params.TID, ok, err);
};

// Remove all issues for a project (route: /api/issue/:PrjName)
exports.removeAllForPrj = function(req, res) {
    // Check for input validation errors in the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn(`Input validation failed: ${JSON.stringify(errors)}`);
        return res.status(422).json({errors: errors.array()});
    }

    let ok = function(doc) {
        logger.info("Successful delete completed");
        res.sendStatus(200);
    };
    let err = function(err) {
        logger.warn(
            `Delete failed for all issues in project ${req.params.PrjName}: ${JSON.stringify(err)}`
        );
        res.send(409, "Failed to remove object");
    };
    issue.removeAllForPrj(req.params.PrjName, ok, err);
};
