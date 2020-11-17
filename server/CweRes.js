/* eslint-env node, mongo, es6 */
var cwe = require("./CweModel")();
const {validationResult} = require("express-validator");
const logger = require("./lib/appLogger.js");

exports.findAll = function (req, res) {
    // Check for input validation errors in the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn(`Input validation failed: ${JSON.stringify(errors)}`);
        return res.status(422).json({errors: errors.array()});
    }
    var ok = function (doc) {
        logger.info("Successful DB search");
        res.json(doc);
    };
    var err = function (err) {
        logger.warn(`Failed DB search: ${JSON.stringify(err)}`);
        res.send(404);
    };
    cwe.findAll(ok, err);
};

exports.findById = function (req, res) {
    // Check for input validation errors in the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn(`Input validation failed: ${JSON.stringify(errors)}`);
        return res.status(422).json({errors: errors.array()});
    }
    var ok = function (doc) {
        logger.info("Successful DB search");
        res.json(doc);
    };
    var err = function (err) {
        logger.warn(`Failed DB search: ${JSON.stringify(err)}`);
        res.status(404).send("Sorry, we cannot find that!");
    };
    cwe.findById(req.params.id, ok, err);
};

exports.findByName = function (req, res) {
    // Check for input validation errors in the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn(`Input validation failed: ${JSON.stringify(errors)}`);
        return res.status(422).json({errors: errors.array()});
    }
    var ok = function (doc) {
        logger.info("Successful DB search");
        res.json(doc);
    };
    var err = function (err) {
        logger.warn(`Failed DB search: ${JSON.stringify(err)}`);
        res.status(404).send("Sorry, we cannot find that!");
    };
    cwe.findByName(req.params.name, ok, err);
};
