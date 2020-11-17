const testkb = require("./TestKBModel")();
//const {validationResult} = require("express-validator/check");
//const {matchedData} = require("express-validator/filter");
const {validationResult, matchedData} = require("express-validator");
const logger = require("./lib/appLogger.js");

exports.findAll = function (req, res) {
    // Check for input validation errors in the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn(`Input validation failed: ${JSON.stringify(errors)}`);
        return res.status(422).json({errors: errors.array()});
    }
    let ok = function (doc) {
        logger.info("Successful search for all testkb entries");
        res.json(doc);
    };
    let err = function (err) {
        logger.warn(`Failed testkb search: ${JSON.stringify(err)}`);
        res.sendStatus(404);
    };
    testkb.findAll(ok, err);
};

exports.findByTID = function (req, res) {
    // Check for input validation errors in the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn(`Input validation failed: ${JSON.stringify(errors)}`);
        return res.status(422).json({errors: errors.array()});
    }
    let ok = function (doc) {
        logger.info("Successful testkb search by TID");
        res.json(doc);
    };
    let err = function (err) {
        logger.warn(`Failed testkb search by TID: ${JSON.stringify(err)}`);
        res.sendStatus(404);
    };
    testkb.findByTID(req.params.TID, ok, err);
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
        logger.info("Successful testkb entry creation");
        res.location("/api/testkb/doc.TID");
        res.status(201).json(bodyData).send();
    };

    let err = function (err) {
        logger.warn(`Failed testkb create: ${JSON.stringify(err)}`);
        res.send(409, "Failed to create object");
    };

    testkb.create(bodyData, ok, err);
};

exports.update = function (req, res) {
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
        logger.info("Successful testkb update");
        res.sendStatus(200);
    };
    let err = function (err) {
        logger.warn(`Failed testkb update: ${JSON.stringify(err)}`);
        res.send(409, "update failed");
    };
    logger.debug(`Updating TestKB with: ${JSON.stringify(bodyData)}`);
    /* 
    TODO: CWE-943 Improper Neutralization of Special Elements in Data Query Logic
    TestKBRes.js: 97
    Severity: High
    Attack Vector: mongodb.Collection.update
    Number of Modules Affected: 1
    Description: This NoSQL API call contains an injection flaw. In the call or reference to mongodb.Collection.update, the application executes an operation designed to manipulate data in the database, but part of that query is constructed from untrusted data. An attacker could exploit this flaw to modify arbitrary data inside the database or replace a query value to bypass authentication or access unauthorized data.
    Remediation: Avoid passing user-generated data to queries outside of data fields. Ensure that query values are validated to authorize the requesting user before accessing the data.
    */
    testkb.update(req.params.TID, bodyData, ok, err);
};
