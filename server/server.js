// Load .env file
require("dotenv").config();
const express = require("express");
const passport = require("passport");
const helmet = require("helmet");
const session = require("express-session");
const path = require("path");
const logger = require("./lib/appLogger.js");
const reqLogger = require("./lib/reqLogger.js");
const methodOverride = require("method-override");
const db = require("./models");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github").Strategy;
const http2Express = require("http2-express-bridge");
const http2 = require("http2");
const config = require("./config.js");
const {check, checkSchema, validationResult, matchedData} = require("express-validator");
const validationSchema = require("./validationSchema.js");
const validationValues = require("./validationValues.js");
const utils = require("./serverUtils.js");
const reporting = require("./reporting.js");
const {exec, execFile} = require("child_process");
const {exit} = require("process");
const {logging, useHttp2} = require("./config.js");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const ensureLoggedIn = require("connect-ensure-login").ensureLoggedIn;
const {Op, Sequelize} = require("sequelize");
const {project} = require("./validationSchema.js");
//const router = express.Router();

// ========================================== CONFIG ==========================================
// Auth/authz config
let users = [];
const authMode = process.env.AUTH_MODE || config.defaultAuthMode;
if (process.env.CSP_REPORT_URI) config.csp.directives.reportUri = process.env.CSP_REPORT_URI;

if (authMode === config.AUTH_MODE_OAUTH) {
    logger.info("Configuring app with OAuth");
    let usersConfig = process.env.USERLIST;
    let userConfig = usersConfig.split(":");
    for (let i in userConfig) {
        let ava = userConfig[i].split(",");
        let user = {};
        for (let j in ava) {
            let [at, val] = ava[j].split("=");
            user[at] = val;
        }
        users.push(user);
    }
    logger.debug(`Authorized users: ${JSON.stringify(users)}`);
} else {
    logger.info("App starting without authentication for dev/testing purposes");
}

// ========================================== EXPRESS ==========================================
// Configure Express
let app;
if (useHttp2) app = http2Express(express);
else app = express();
app.disable("x-powered-by");
app.use(reqLogger);
app.use(cookieParser());
app.use(bodyParser.json({limit: "5mb"}));
app.use(bodyParser.json({type: "application/csp-report"}));
app.use(bodyParser.json({type: "application/json"}));
app.use(bodyParser.urlencoded({extended: true, limit: "5mb"}));
app.use(bodyParser.text());
app.use(methodOverride());
if (authMode == config.AUTH_MODE_OAUTH) require("./auth")();
app.use(session(config.session));
if (authMode == config.AUTH_MODE_OAUTH) {
    app.use(passport.initialize());
    app.use(passport.session());
}

// Patch from https://github.com/nanoexpress/nanoexpress/issues/251
//  Fixes below issue:
//     2021-11-27T10:49:16.687Z error: uncaughtException: res._implicitHeader is not a function
//       TypeError: res._implicitHeader is not a function
//         at writetop (/app/node_modules/express-session/index.js:276:15)
//         at Http2ServerResponse.end (/app/node_modules/express-session/index.js:343:16) [...]
if (config.useHttp2) {
    logger.info("Using HTTP/2, applying patch in express-session when res._implicitHeader()");
    app.use(function async(req, res, next) {
        if (!res._implicitHeader) {
            res._implicitHeader = function () {
                if (!res._header && !res.headersSent) {
                    res.writeHead(res.statusCode);
                }
            };
        }
        next();
    });
}

// Activate and configure helmet for Content Security Policy
app.use(helmet.contentSecurityPolicy(config.csp));

//app.use(express.text({defaultCharset: "utf-8"}));
app.use(express.text({defaultCharset: "ISO-8859-1"}));

// IMPORTANT: place this before static or similar middleware directory is where markdown files are stored
app.use(require("./lib/express-markdown")({directory: path.join(__dirname, "../doc")}));

// Serve static content -- ref.: https://expressjs.com/en/4x/api.html#express.static
app.use(express.static(path.join(__dirname, "../client"), config.staticOptions));
app.use("/screenshots", express.static(path.join(__dirname, "../doc/screenshots/"), config.staticOptions));

// Serve jquery npm module content to clients.  NOTE: make sure client source fiels use: <script src="/jquery/jquery.js"></script>
app.use("/dist/bootstrap", express.static(path.join(__dirname, "../node_modules/bootstrap/dist/"), config.staticOptions));
app.use("/dist/jquery", express.static(path.join(__dirname, "../node_modules/jquery/dist/"), config.staticOptions));
app.use("/dist/lodash", express.static(path.join(__dirname, "../node_modules/lodash/"), config.staticOptions));
app.use("/dist/handlebars", express.static(path.join(__dirname, "../node_modules/handlebars/dist/"), config.staticOptions));
app.use("/dist/validator", express.static(path.join(__dirname, "../node_modules/validator/"), config.staticOptions));
app.use("/dist/reactive-handlebars", express.static(path.join(__dirname, "../reactive-handlebars/src/"), config.staticOptions));

// Serve private static content
app.use(
    express.static(path.join(__dirname, "../waptrun-static/"), {
        setHeaders: function (res, path, stat) {
            res.set("content-type", "windows-1252");
        },
    })
);

// Simple route middleware to ensure user is authenticated.
function ensureAuthenticated(req, res, next) {
    if (authMode == config.AUTH_MODE_NONE) return next();
    //if (req.isAuthenticated()) { return next(); }
    if (ensureLoggedIn()) {
        return next();
    }
    logger.warn(`Client is not authenticated (authMode=${authMode}), sending 401`);
    res.status(401).send("Not Authenticated.");
}

// Test authorization
function ensureAuthorized(req, res, next) {
    if (authMode == config.AUTH_MODE_NONE) return next();
    let id = req.user.id;
    let provider = req.user.provider;
    let url = req.originalUrl;
    logger.silly(`Ensuring that user ${id} from provider ${provider} is authorized for ${url}. User data = ${JSON.stringify(req.user)}`);
    let user = users.find((usr) => {
        return usr.id === id && usr.provider === provider;
    });
    if (user === undefined) {
        logger.warn(`Client is not authorized (authMode=${authMode}), sending 401`);
        res.status(401).send("Not Authorized.");
    } else {
        logger.info(`User ${id} is authorized`);
        next();
    }
}

// Session-persisted message middleware
app.use(function (req, res, next) {
    let err = req.session.error,
        msg = req.session.notice,
        success = req.session.success;

    delete req.session.error;
    delete req.session.success;
    delete req.session.notice;

    if (err) res.locals.error = err;
    if (msg) res.locals.notice = msg;
    if (success) res.locals.success = success;

    next();
});

if (authMode == config.AUTH_MODE_OAUTH) {
    // ============================== GOOGLE AUTH ROUTES ==========================================
    app.get("/auth/google", passport.authenticate("google", {scope: ["profile"]}));
    app.get("/auth/google/callback", passport.authenticate("google", {failureRedirect: "/login"}), function (req, res) {
        // Successful authentication, redirect home.
        res.redirect("/home");
    });

    // ============================== GITHUB AUTH ROUTES ==========================================
    app.get("/auth/github", passport.authenticate("github"));
    app.get("/auth/github/callback", passport.authenticate("github", {failureRedirect: "/login"}), function (req, res) {
        // Successful authentication, redirect home.
        res.redirect("/home");
    });
}

// ==================================== LOGOUT ================================================
app.get("/logout", function (req, res, next) {
    if (authMode == config.AUTH_MODE_NONE) {
        logger.info("Logging out is not needed!");
        res.redirect(req.get("Referer"));
    } else {
        logger.info("Logging out");
        req.logout();
    }
});

// ========================================== REST ROUTES ==========================================

/**
 * @openapi
 * /api/ping:
 *   get:
 *     description: API test endpoint
 *     responses:
 *       200:
 *         description: ping response message
 */
app.get("/api/ping", (req, res) => {
    logger.info("Incoming ping request");
    res.send("Ping response, it works!");
});

// CSV violation logger
app.post("/report-violation", (req, res) => {
    logger.info("Incoming report-violation request");
    const op = "csp-report-violation";
    ok(op, res, req.body);
});

// Check if authenticated/authorized to use the REST API
app.all("/api/*", ensureAuthenticated, ensureAuthorized, function (req, res, next) {
    next();
});

// Server API documentation
const openapiSpecification = swaggerJsdoc(config.openapi);
app.use("/api/doc", swaggerUi.serve, swaggerUi.setup(openapiSpecification));

// Backup DB
app.post("/api/db/backup", (req, res, next) => {
    logger.info("Incoming DB backup request");
    exec("/app/utils/backup.sh", (error, stdout, stderr) => {
        if (error) {
            msg = `Error when backing-up DB: ${error}`;
            console.error(msg);
            return res.status(500).json({error: JSON.stringify(msg)});
        }
        let msg = {stdout: stdout, stderr: stderr};
        logger.info(`Backup result: ${JSON.stringify(msg)}`);
        res.json(msg);
    });
});

// Show account info
/**
 * @openapi
 * /api/account:
 *   get:
 *     description: Get user account information
 *     security:
 *       cookieAuth: []
 *     responses:
 *       200:
 *         description: Account information
 */
app.get("/api/account", function (req, res) {
    logger.info("Incoming account information request");
    let user = authMode == config.AUTH_MODE_NONE ? config.LOCAL_USER : req.user;
    if (authMode == config.AUTH_MODE_OAUTH) {
        logger.debug(`Logged in. User ID ${req.user.id} from provider ${req.user.provider}`);
        res.json(req.user);
    } else {
        let data = {
            provider: "None",
            sub: "None",
            id: "anon",
            displayName: "Anonymous",
            name: {givenName: "", familyName: ""},
            given_name: "",
            family_name: "",
            language: "en",
            photos: [{value: "", type: ""}],
            picture: "",
        };
        res.json(data);
    }
});

// Show all projects
app.get("/api/project", (req, res) => {
    logger.info("Incoming projects search request");
    const op = "get-all-projects";
    // prettier-ignore
    db.project.findAll().then((d) => {ok(op, res, d);}).catch((e) => {notFound(op, res, e);});
});

// Get project data, check for pattern YYYYMM[DD]-PrjName-EnvName
app.get("/api/project/:name", check("name").matches(validationValues.PrjName.matches), (req, res) => {
    logger.info("Incoming project search request");
    const op = "find-one-project";
    // Check for input validation errors in the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn(`Input validation failed: ${JSON.stringify(errors)}`);
        failure("validate-req", res, {errors: errors.array()});
        return;
    }
    // prettier-ignore
    db.project.findOne({where: {name: req.params.name}}).then((d) => {ok(op, res, d);}).catch((e) => {notFound(op, res, e);});
});

// Create project
app.post("/api/project", checkSchema(validationSchema.project), (req, res) => {
    logger.info("Incoming project creation request");
    const op = "create-project";

    // Check for input validation errors in the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn(`Input validation failed: ${JSON.stringify(errors)}`);
        failure("validate-req", res, {errors: errors.array()});
        return;
    }

    // Use the filter API of express-validator to only include the fields included in the schema
    const bodyData = matchedData(req, {
        includeOptionals: false,
        onlyValidData: true,
        locations: ["body"],
    });
    // prettier-ignore
    db.project.create(bodyData).then((d) => {created(op, res, d);}).catch((e) => {notFound(op, res, e);});
});

// Update project
app.put("/api/project/:name", checkSchema(validationSchema.project), (req, res) => {
    logger.info("Incoming project update request");

    // Check for input validation errors in the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn(`Input validation failed: ${JSON.stringify(errors)}`);
        failure("validate-req", res, {errors: errors.array()});
        return;
    }

    const bodyData = matchedData(req, {
        includeOptionals: false,
        onlyValidData: true,
        locations: ["body"],
    });

    logger.info(`Updating ${req.params.name}`);
    const op = "update-project";
    // prettier-ignore
    db.project.update(bodyData, {where: {name: req.params.name}}).then((d) => {ok(op, res, d);}).catch((e) => {notFound(op, res, e);});
});

// Delete project. Check for pattern YYYYMM[DD]-PrjName-EnvName.
app.delete("/api/project/:name", check("name").matches(validationValues.PrjName.matches), (req, res) => {
    logger.info("Incoming project deletion request");
    const op = "delete-project";
    // Check for input validation errors in the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn(`Input validation failed: ${JSON.stringify(errors)}`);
        failure("validate-req", res, {errors: errors.array()});
        return;
    }

    // prettier-ignore
    db.project.destroy({where: {name: req.params.name}}).then((d)=>{ok(op, res, d);}).catch((e)=>{notFound(op,res,e);});
});

// Get data for all tests
app.get("/api/testkb", (req, res) => {
    logger.info("Incoming tests search request");
    const op = "get-all-tests";
    // Check for input validation errors in the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn(`Input validation failed: ${JSON.stringify(errors)}`);
        failure("validate-req", res, {errors: errors.array()});
        return;
    }

    // prettier-ignore
    db.test.findAll().then((d) => {ok(op, res, d);}).catch((e) => {notFound(op, res, e);});
});

// Get data for a specific Test ID. Check for allowable TID chars (letters, numbers, dash, dots).
app.get("/api/testkb/:TID", check("TID").matches(validationValues.TID.matches), (req, res) => {
    logger.info("Incoming test search request");
    const op = "get-test";
    // Check for input validation errors in the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn(`Input validation failed: ${JSON.stringify(errors)}`);
        failure("validate-req", res, {errors: errors.array()});
        return;
    }
    // prettier-ignore
    db.test.findOne({where: {TID: req.params.TID}}).then((d) => {ok(op, res, d);}).catch((e) => {notFound(op, res, e);});
});

// Create a new test
app.post("/api/testkb", checkSchema(validationSchema.testKB), (req, res) => {
    logger.info("Incoming test creation request");
    const op = "create-test";

    // Check for input validation errors in the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn(`Input validation failed: ${JSON.stringify(errors)}`);
        failure("validate-req", res, {errors: errors.array()});
        return;
    }

    // Use the filter API of express-validator to only include the fields included in the schema
    const bodyData = matchedData(req, {
        includeOptionals: false,
        onlyValidData: true,
        locations: ["body"],
    });

    // prettier-ignore
    db.test.create(bodyData).then((d) => {created(op, res, d);}).catch((e) => {notFound(op, res, e);});
});

// Update an existing test
app.put("/api/testkb/:TID", checkSchema(validationSchema.testKB), (req, res) => {
    logger.info("Incoming test update request");
    const op = "update-test";

    // Check for input validation errors in the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn(`Input validation failed: ${JSON.stringify(errors)}`);
        failure("validate-req", res, {errors: errors.array()});
        return;
    }

    // Use the filter API of express-validator to only include the fields included in the schema
    const bodyData = matchedData(req, {
        includeOptionals: false,
        onlyValidData: true,
        locations: ["body"],
    });

    // prettier-ignore
    db.test.update(bodyData, {where: {TID: req.params.TID}}).then((d) => {ok(op, res, d);}).catch((e) => {notFound(op, res, e);});
});

// Get all issues for all projects
app.get("/api/issue", (req, res) => {
    logger.info("Incoming issues search request");
    const op = "get-all-issues";

    // Check for input validation errors in the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn(`Input validation failed: ${JSON.stringify(errors)}`);
        failure("validate-req", res, {errors: errors.array()});
        return;
    }

    // prettier-ignore
    db.issue.findAll().then((d)=>{ok(op, res, d);}).catch((e)=>{notFound(op, res, e);});
});

// Get all issues for a specific project. Check for pattern YYYYMM[DD]-PrjName-EnvName.
app.get("/api/issue/:PrjName", check("PrjName").matches(validationValues.PrjName.matches), (req, res) => {
    logger.info("Incoming project issues search request");
    const op = "get-all-project-issues";

    // Check for input validation errors in the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn(`Input validation failed: ${JSON.stringify(errors)}`);
        failure("validate-req", res, {errors: errors.array()});
        return;
    }
    // prettier-ignore
    db.issue.findAll({where:{PrjName:req.params.PrjName}, order: [["IPriority", "ASC"],["TIssueName", "ASC"],["TID", "ASC"]]}).then((d)=>{ok(op,res,d);}).catch((e)=>{notFound(op, res,e);});
});

// Delete all issues in a project. Check for pattern YYYYMM[DD]-PrjName-EnvName.
app.delete("/api/issue/:PrjName", check("PrjName").matches(validationValues.PrjName.matches), (req, res) => {
    logger.info("Incoming project issues deletion request");
    const op = "delete-all-project-issues";

    // Check for input validation errors in the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn(`Input validation failed: ${JSON.stringify(errors)}`);
        failure("validate-req", res, {errors: errors.array()});
        return;
    }

    // prettier-ignore
    db.issue.destroy({where: {PrjName: req.params.PrjName}}).then((d) => {ok(op, res, d);}).catch((e) => {notFound(op, res, e);});
});

// Create/update an issue
app.put("/api/issue/:PrjName/:TID", checkSchema(validationSchema.issue), (req, res) => {
    logger.info("Incoming project issue update request");
    const op = "upsert-project-issue";

    // Check for input validation errors in the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn(`Input validation failed: ${JSON.stringify(errors)}`);
        failure("validate-req", res, {errors: errors.array()});
        return;
    }

    // Use the filter API of express-validator to only include the fields included in the schema
    const bodyData = matchedData(req, {
        includeOptionals: false,
        onlyValidData: true,
        locations: ["body"],
    });

    logger.debug(`Upsert project issue data: ${JSON.stringify(bodyData)}`);
    // prettier-ignore
    //db.issue.upsert(bodyData, {validate: false})
    db.issue.update(bodyData, {where: {PrjName: req.params.PrjName, TID: req.params.TID}})
        .then((d) => {ok(op, res, d);}).catch((e) => {notFound(op, res, e);});
});

// Create issue TODOs for a given project. Check for pattern YYYYMM[DD]-PrjName-EnvName.
app.post("/api/issue/:PrjName/todos", check("PrjName").matches(validationValues.PrjName.matches), (req, res) => {
    logger.info("Incoming project todo creation request");
    const op = "create-todo-issues";

    // Check for input validation errors in the request
    const errors = validationResult(req);
    // prettier-ignore
    if (!errors.isEmpty()) { logger.warn("Input validation failed for project name"); failure("validate-req", res, {errors: errors.array()}); return; }

    // Get project
    logger.debug(`Creating TODO tests for project ${req.params.PrjName}`);
    db.project
        .findOne({where: {name: req.params.PrjName}})
        .then((prj) => {
            // Get scope query
            let scopeQuery = utils.getSequelizeScopeQuery(prj);

            // Search the Test KB for matching tests
            logger.info("Searching TestKB with scope");
            db.test
                .findAll({where: scopeQuery})
                .then((tests) => {
                    logger.info(`Applicable tests: ${JSON.stringify(tests)}`);

                    // Check for input validation errors in the request
                    const errors = validationResult(req);
                    if (!errors.isEmpty()) {
                        logger.warn(`Input validation failed: ${JSON.stringify(errors)}`);
                        failure("validate-req", res, {errors: errors.array()});
                        return;
                    }

                    logger.info(`Creating TODOs for ${req.params.PrjName}`);
                    for (let test of tests) {
                        let data = {};
                        logger.info(`Creating TODO for TID ${test.TID}`);
                        data.TID = test.TID;
                        data.PrjName = req.params.PrjName;
                        data.CweId = test.TCweID;
                        data.IPriority = 6;
                        data.IPriorityText = "TODO";
                        data.TIssueName = test.TIssueName;
                        if (!data.TIssueName) data.TIssueName = test.TTestName;

                        // Add issue
                        // prettier-ignore
                        db.issue.create(data).then((d) => {logger.debug(`TODO created: ${JSON.stringify(data)}`);})
                                            .catch((e) => {failure(op, res, e); return;});
                    }
                    created(op, res, {});
                })
                .catch((e) => {
                    notFound("find-all-prj-tests", res, e);
                });
        })
        .catch((e) => {
            notFound("find-one-project", res, e);
        });
});

// Delete an issue. Check for pattern YYYYMM[DD]-PrjName-EnvName and valid TID.
// prettier-ignore
app.delete("/api/issue/:PrjName/:TID",check("PrjName").matches(validationValues.PrjName.matches), check("TID").matches(validationValues.TID.matches), (req, res) => {
        logger.info("Incoming project issue deletion request");
        const op = "delete-project-issue";

        // Check for input validation errors in the request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            logger.warn(`Input validation failed: ${JSON.stringify(errors)}`);
            failure("validate-req", res, {errors: errors.array()});
            return;
        }

        // prettier-ignore
        //let crit = {}, kvp1 = {}, kvp2 = {};
        //kvp1.TID = req.params.TID;
        //kvp2.PrjName = req.params.PrjName;
        //crit["[Op.and]"] = [kvp1, kvp2];
        let crit = {TID: req.params.TID, PrjName: req.params.PrjName};
        logger.debug(`Deleting project issue data with criteria ${JSON.stringify(crit)}`);
        // prettier-ignore
        db.issue.destroy({where: crit}).then((d) => {ok(op, res, d);}).catch((e) => {notFound(op, res, e);});
    }
);

// Get data for an issue. Check for allowable TID chars (letters, numbers, dash, dots)
app.get("/api/issue/:PrjName/:TID", check("PrjName").matches(validationValues.PrjName.matches), check("TID").matches(validationValues.TID.matches), (req, res) => {
    logger.info("Incoming project issue search request");
    const op = "get-project-issue";

    // Check for input validation errors in the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn(`Input validation failed: ${JSON.stringify(errors)}`);
        failure("validate-req", res, {errors: errors.array()});
        return;
    }

    // Build search criteria
    // prettier-ignore
    let crit = {TID: req.params.TID, PrjName: req.params.PrjName};
    logger.debug(`Searching for project issue data with criteria ${JSON.stringify(crit)}`);
    // prettier-ignore
    db.issue.findOne({where: crit}).then((d) => {ok(op, res, d);}).catch((e) => {notFound(op, res, e);});
});

// Get list of CWEs
app.get("/api/cwe", (req, res) => {
    logger.info("Incoming CWEs search request");
    const op = "get-cwes";

    // prettier-ignore
    db.cwe.findAll().then((d) => {ok(op, res, d);}).catch((e) => {notFound(op, res, e);});
});

// Get data for a CWE. Check CWE ID.
app.get("/api/cwe/:CweId", check("CweId").isInt(validationValues.CweId.isInt), (req, res) => {
    logger.info("Incoming CWE search request");
    const op = "get-cwe";

    // prettier-ignore
    db.cwe.findOne({where: {CweId: req.params.CweId}}).then((d) => {ok(op, res, d);})
        .catch((e) => {notFound(op, res, e);});
});

// Get testing data for a project. Check for pattern YYYYMM[DD]-PrjName-EnvName.
app.get("/api/testing/:PrjName", check("PrjName").matches(validationValues.PrjName.matches), (req, res) => {
    logger.info("Incoming project tests request");
    const op = "get-project-tests";

    // Check for input validation errors in the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn("Input validation failed for project name");
        failure("validate-req", res, {errors: errors.array()});
        return;
    }

    // Get project
    logger.debug(`Checking if entry exists for project ${req.params.PrjName}`);
    // prettier-ignore
    db.project.findOne({where: {name: req.params.PrjName}})
            .then((prj) => {
                // Get scope query
                let scopeQuery = utils.getSequelizeScopeQuery(prj);

                // Search the Test KB for matching tests
                logger.debug("Searching TestKB with scope query ", scopeQuery);
                let testKbFields = ["TID", "TSource", "TTestName"];
                db.test.findAll({where: scopeQuery, order: [["TID", "ASC"]], attributes: testKbFields})
                    .then((tests) => {
                        const testingPageData = {prj: prj, tests: tests, CweUriBase: config.CweUriBase, CveRptBase: config.CveRptBase, CveRptSuffix: config.CveRptSuffix, TestRefBase: config.TestRefBase, ScopeQuery: JSON.stringify(scopeQuery)};
                        logger.info(`Returning testing page data for project ${req.params.PrjName}`);
                        res.json(testingPageData);
                    })
                    .catch((err) => {
                        logger.warn(`Failed getting testing page data (in tests search): ${JSON.stringify(err)}`);
                        failure("findall-scoped-tests", res, err);
                    });
            })
            .catch((err) => {
                logger.warn(`Failed getting testing page data (in project search): ${JSON.stringify(err)}`);
                failure("findone-project", res, err);
            });
});

// ======================================= EXPORT/REPORT ROUTES =======================================
// Check if authenticated/authorized to export data
app.all("/export/*", ensureAuthenticated, ensureAuthorized, function (req, res, next) {
    next();
});

// Export all issues for all projects in CSV
//app.get("/export/issues.csv", reporting.exportIssuesCSV);

// Export all issues for a specific project in CSV. Check for pattern YYYYMM[DD]-PrjName-EnvName.
// prettier-ignore
app.get("/export/csv/:PrjName", check("PrjName").matches(validationValues.PrjName.matches), (req, res) => {
    logger.info("Incoming project issues CSV export request");

    // Check for input validation errors in the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn("Input validation failed for project name");
        failure("validate-req", res, {errors: errors.array()});
        return;
    }
    //reporting.genPrjIssueReportCSV(req, res);
    reporting.sendProjectReport(req, res, config.REPORT_TYPE_CSV, showAllIssues=true);
});

// Export all issues for a specific project in JSON. Check for pattern YYYYMM[DD]-PrjName-EnvName.
// prettier-ignore
app.get("/export/json/:PrjName", check("PrjName").matches(validationValues.PrjName.matches), (req, res) => {
    logger.info("Incoming project issues JSON export request");

    // Check for input validation errors in the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn("Input validation failed for project name");
        failure("validate-req", res, {errors: errors.array()});
        return;
    }
    reporting.sendProjectReport(req, res, config.REPORT_TYPE_JSON, showAllIssues=true);
});

// Generate a Findings Report for a project in HTML, Check for pattern YYYYMM[DD]-PrjName-EnvName.
// prettier-ignore
app.get("/export/html/findings/:PrjName",check("PrjName").matches(validationValues.PrjName.matches), (req, res) => {
    logger.info("Incoming project findings HTML report request");

    // Check for input validation errors in the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn("Input validation failed for project name");
        failure("validate-req", res, {errors: errors.array()});
        return;
    }
    //reporting.genPrjIssueFindingsReportHtml(req, res);
    reporting.sendProjectReport(req, res, config.REPORT_TYPE_HTML, showAllIssues=false);
});

// Generate a Full Report for a project in HTML. Check for pattern YYYYMM[DD]-PrjName-EnvName.
// prettier-ignore
app.get("/export/html/full/:PrjName", check("PrjName").matches(validationValues.PrjName.matches), (req, res) => {
    logger.info("Incoming project full HTML report request");

    // Check for input validation errors in the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn("Input validation failed for project name");
        failure("validate-req", res, {errors: errors.array()});
        return;
    }
    //reporting.genPrjIssueFullReportHtml(req, res);
    reporting.sendProjectReport(req, res, config.REPORT_TYPE_HTML, showAllIssues=true);
});

// ========================================== ERROR HANDLING ==========================================
// Middleware with an arity of 4 are considered error handling middleware. When you next(err), it will
// be passed through the defined middleware in order, but ONLY those with an arity of 4, ignoring
// regular middleware.
app.use(function (err, req, res, next) {
    let msg = err.message;
    if (msg.startsWith("Cannot read properties of undefined")) msg += ". Session was probably invalidated via logout or timeout.";
    logger.error(`Exception: ${msg}`);
    // TODO: Toggle comments on below 3 lines for security (eventually)
    //res.sendStatus(500);
    res.status(500).send({error: msg, additionalInfo: "Caught by global exception handler."});
});

// Our custom JSON 404 middleware. Since it's placed last it will be the last middleware called,
// if all others invoke next() and do not respond.
app.use(function (req, res) {
    res.status(404);
    res.send({Error: "This request is unsupported!"});
});

// ========================================== START LISTENER ==========================================
const port = process.env.PORT || config.port;

if (config.useHttp2) {
    // Get key and cert to support HTTP/2
    const options = {
        key: fs.readFileSync(path.join(__dirname, "../data/privkey3.pem")),
        cert: fs.readFileSync(path.join(__dirname, "../data/cert3.pem")),
        allowHTTP1: true,
    };

    let server = http2.createSecureServer(options, app);
    server.listen(port, (error) => {
        if (error) {
            logger.error(error);
            return process.exit(1);
        } else {
            logger.info(`Listening on port ${port} serving HTTP/2`);
        }
    });
} else {
    app.listen(port);
    /* eslint-disable */
    logger.info(`Listening on port ${port} serving HTTP/1.1`);
    /* eslint-enable */
}

function created(op, res, data) {
    if (data) {
        logger.info(`Creation succeeded for ${op} - resulting data: ${JSON.stringify(data)}`);
        res.send(201);
    } else {
        logger.warn(`Request succeeded. No data`);
        res.send(204);
    }
}

function ok(op, res, data) {
    if (data) {
        logger.info(`Request succeeded for ${op}: ${JSON.stringify(data)}`);
        if (typeof data === "number") data = `Value: ${data}`;
        res.status(200).send(data);
    } else {
        logger.info(`Request succeeded for ${op}. No data`);
        res.send(204);
    }
}

function failure(op, res, err) {
    logger.error(`Request failed for ${op}: ${JSON.stringify(err)}`);
    // TODO: Toggle comments on below two lines for security (eventually)
    //res.sendStatus(400);
    res.status(400).send(err);
}

function notFound(op, res, err) {
    logger.warn(`Could not find data for ${op}: ${JSON.stringify(err.message)}`);
    // TODO: Toggle comments on below two lines for security (eventually)
    //res.sendStatus(404);
    res.status(404).send(err.message);
}
