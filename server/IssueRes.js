const issue = require("./IssueModel")();
const {validationResult, matchedData} = require("express-validator");
const logger = require("./lib/appLogger.js");

// Find all issues in all projects (routes: /api/issue, /issues.csv)
exports.findAll = function (req, res) {
    // Check for input validation errors in the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn(`Input validation failed: ${JSON.stringify(errors)}`);
        return res.status(422).json({errors: errors.array()});
    }
    let ok = function (doc) {
        logger.info("Successful search for all issues.");
        res.json(doc);
    };
    let err = function (_err) {
        logger.warn(`Failed search for all issues: ${JSON.stringify(_err)}`);
        res.send(404);
    };
    issue.findAll(ok, err);
};

// Find an issue by project name and test ID (route: /api/issue/:PrjName/:TID)
exports.findIssue = function (req, res) {
    // Check for input validation errors in the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn(`Input validation failed: ${JSON.stringify(errors)}`);
        return res.status(422).json({errors: errors.array()});
    }
    let ok = function (doc) {
        logger.info("Succeeded search for issue");
        res.json(doc);
    };
    let err = function (_err) {
        //res.send(404);
        logger.warn(`Failed issue search: ${JSON.stringify(_err)}`);
        res.sendStatus(404);
    };
    issue.findIssue(req.params.PrjName, req.params.TID, ok, err);
};

// Find all issues for a project (routes: /api/issue/:PrjName, /export/csv/:PrjName, /export/html/:PrjName)
exports.findProjectIssues = function (req, res) {
    // Check for input validation errors in the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn(`Input validation failed: ${JSON.stringify(errors)}`);
        return res.status(422).json({errors: errors.array()});
    }
    let ok = function (doc) {
        logger.info("Succeeded with project issue search");
        res.json(doc);
    };
    let err = function (_err) {
        logger.warn(`Failed search for project issues: ${JSON.stringify(_err)}`);
        res.sendStatus(404);
    };
    issue.findIssue(req.params.PrjName, ok, err);
};

// Upsert an issue (route: /api/issue/:PrjName/:TID)
exports.upsert = function (req, res) {
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
        logger.info("Successful issue upsert completed");
        res.sendStatus(200);
    };
    let err = function (_err) {
        logger.warn(`Upsert issue failed: ${JSON.stringify(_err)}`);
        res.send(409, "Upsert issue failed");
    };
    issue.upsert(req.params.PrjName, req.params.TID, bodyData, ok, err);
};

// Create TODO issues (route: /api/issue/:PrjName/todos)
exports.createTodos = function (req, res, tests) {
    // Check for input validation errors in the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn(`Input validation failed: ${JSON.stringify(errors)}`);
        return res.status(422).json({errors: errors.array()});
    }

    let ok = function (doc) {
        logger.info("Successful createTodos operation");
        res.sendStatus(200);
    };
    let err = function (_err) {
        logger.warn(`createTodos failed: ${JSON.stringify(_err)}`);
        res.send(409, "createTodos failed");
    };
    logger.info(`Creating TODOs for ${req.params.PrjName}`);
    issue.createTodos(req.params.PrjName, tests, ok, err);
};

// Remove an issue by name (route: /api/issue/:PrjName/:TID)
exports.removeByName = function (req, res) {
    // Check for input validation errors in the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn(`Input validation failed: ${JSON.stringify(errors)}`);
        return res.status(422).json({errors: errors.array()});
    }

    let ok = function (doc) {
        logger.info("Successful issue delete");
        res.sendStatus(200);
    };
    let err = function (_err) {
        logger.warn(`Issue deletion failed: ${JSON.stringify(_err)}`);
        res.send(409, "Failed to remove issue");
    };
    issue.removeByName(req.params.PrjName, req.params.TID, ok, err);
};

// Remove all issues for a project (route: /api/issue/:PrjName)
exports.removeAllForPrj = function (req, res) {
    // Check for input validation errors in the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn(`Input validation failed: ${JSON.stringify(errors)}`);
        return res.status(422).json({errors: errors.array()});
    }

    let ok = function (doc) {
        logger.info("Successful deletion of all issues for project");
        res.sendStatus(200);
    };
    let err = function (_err) {
        logger.warn(
            `Delete failed for all issues in project ${req.params.PrjName}: ${JSON.stringify(_err)}`
        );
        res.send(409, "Failed to remove issue");
    };
    issue.removeAllForPrj(req.params.PrjName, ok, err);
};
