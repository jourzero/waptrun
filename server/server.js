// Load .env file
require("dotenv").config();
//const cors = require("cors");
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

// Enable CORS while using https://inspector.swagger.io/builder
//app.use(cors());

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
    // HTTP STATUS: 401 Unauthorized - Indicates that the request requires user authentication information. The client MAY repeat the request with a suitable Authorization header field
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
        // HTTP STATUS: 401 Unauthorized - Indicates that the request requires user authentication information. The client MAY repeat the request with a suitable Authorization header field
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
 *       '200':
 *         description: ping response message
 *     summary: Check service
 *     tags:
 *       - Monitoring and Admin
 */
app.get("/api/ping", (req, res) => {
    logger.info("Incoming ping request");
    // HTTP STATUS: 200 OK - Indicates that the request has succeeded.
    res.status(200).send("Ping response, it works!");
});

/**
 * @openapi
 * /report-violation:
 *   post:
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/cspReport'
 *     responses:
 *       '200':
 *         description: Success
 *     summary: Endpoint for browsers to report Content Security Policy (CSP) violations
 *     tags:
 *       - Monitoring and Admin
 */
app.post("/report-violation", (req, res) => {
    logger.info("Incoming report-violation request");
    const op = "csp-report-violation";
    ok(op, res, {});
});

// Check if authenticated/authorized to use the REST API
app.all("/api/*", ensureAuthenticated, ensureAuthorized, function (req, res, next) {
    next();
});

// Server API documentation
const openapiSpecification = swaggerJsdoc(config.openapi);
fs.writeFileSync(config.openapiFilename, JSON.stringify(openapiSpecification, null, 2));
app.use("/apidoc", swaggerUi.serve, swaggerUi.setup(openapiSpecification));

/**
 * @openapi
 * /api/db/backup:
 *   post:
 *     request:
 *     security:
 *       cookieAuth: []
 *     responses:
 *       '200':
 *         description: Success
 *       '500':
 *         description: Server failure
 *     summary: Backup DB
 *     tags:
 *       - Monitoring and Admin
 */
app.post("/api/db/backup", (req, res, next) => {
    logger.info("Incoming DB backup request");
    exec("/app/utils/backup.sh", (error, stdout, stderr) => {
        if (error) {
            let msg = `Error when backing-up DB: ${error}`;
            console.error(msg);
            // HTTP STATUS: 500 Internal Server Error - The server encountered an unexpected condition which prevented it from fulfilling the request.
            return res.status(500).json({error: JSON.stringify(msg)});
        }
        let msg = {stdout: stdout, stderr: stderr};
        logger.info(`Backup result: ${JSON.stringify(msg)}`);
        res.json(msg);
    });
});

/**
 * @openapi
 * /api/account:
 *   get:
 *     description: Get user account information
 *     operationId: get-api-account
 *     security:
 *       cookieAuth: []
 *     responses:
 *       '200':
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/account'
 *       '204':
 *         description: Success (no data)
 *       '404':
 *         description: Not found
 *     summary: Get user account info
 *     tags:
 *       - Account
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
            photos: [{value: "/images/anon.png", type: "image"}],
            picture: "",
        };
        res.json(data);
    }
});

/**
 * @openapi
 * /api/project:
 *   get:
 *     request:
 *     security:
 *       cookieAuth: []
 *     responses:
 *       '200':
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/project'
 *       '404':
 *         description: Not found (DB error)
 *     summary: Get all projects
 *     tags:
 *       - Project
 */
app.get("/api/project", (req, res) => {
    logger.info("Incoming projects search request");
    const op = "get-all-projects";
    // prettier-ignore
    db.project.findAll().then((d) => {ok(op, res, d);}).catch((e) => {notFound(op, res, e);});
});

/**
 * @openapi
 * /api/project/{name}:
 *   get:
 *     description: 'Get data for a project'
 *     operationId: get-project
 *     parameters:
 *       - name: name
 *         in: path
 *         description: Project name
 *         required: true
 *         schema:
 *           type: string
 *         example: "20211201-MyApp-QA"
 *     security:
 *       cookieAuth: []
 *     responses:
 *       '200':
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/project'
 *       '204':
 *         description: Success (no data)
 *       '400':
 *         description: Request failure (check inputs)
 *       '404':
 *         description: Not found (DB error)
 *     summary: Get project data
 *     tags:
 *       - Project
 */
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

/**
 * @openapi
 * /api/project:
 *   post:
 *     requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/project'
 *     security:
 *       cookieAuth: []
 *     responses:
 *       '201':
 *         description: Created
 *       '400':
 *         description: Request failure (check inputs)
 *       '404':
 *         description: Not found (DB error)
 *     summary: Create project
 *     tags:
 *       - Project
 */
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

/**
 * @openapi
 * /api/project/{name}:
 *   put:
 *     parameters:
 *       - name: name
 *         in: path
 *         description: Project name
 *         required: true
 *         schema:
 *           type: string
 *         example: "20211201-MyApp-QA"
 *     requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/project'
 *     security:
 *       cookieAuth: []
 *     responses:
 *       '200':
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               properties: {}
 *               type: object
 *       '204':
 *         description: Success (no data)
 *       '400':
 *         description: Request failure (check inputs)
 *       '404':
 *         description: Not found (DB error)
 *     summary: Update project
 *     tags:
 *       - Project
 */
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

/**
 * @openapi
 * /api/project/{name}:
 *   delete:
 *     parameters:
 *       - name: name
 *         in: path
 *         description: Project name
 *         required: true
 *         schema:
 *           type: string
 *         example: "20211201-MyApp-QA"
 *     security:
 *       cookieAuth: []
 *     responses:
 *       '200':
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               properties: {}
 *               type: object
 *       '204':
 *         description: Success (no data)
 *       '400':
 *         description: Request failure (check inputs)
 *       '404':
 *         description: Not found (DB error)
 *     summary: Delete project. Check for pattern YYYYMM[DD]-PrjName-EnvName.
 *     tags:
 *       - Project
 */
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

/**
 * REMOVED API
 * /api/testkb:
 *   get:
 *     request:
 *     security:
 *       cookieAuth: []
 *     responses:
 *       '200':
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                  $ref: '#/components/schemas/testKB'
 *       '404':
 *         description: Not found (DB error)
 *     summary: Get data for all tests
 *     tags:
 *       - TestKB
 */
/* REMOVED API: RETURNS TOO MUCH DATA
app.get("/api/testkb", (req, res) => {
    logger.info("Incoming tests search request");
    const op = "get-all-tests";
    // prettier-ignore
    db.test.findAll().then((d) => {ok(op, res, d);}).catch((e) => {notFound(op, res, e);});
});
*/

/**
 * @openapi
 * /api/testkb/{TID}:
 *   get:
 *     parameters:
 *       - name: TID
 *         in: path
 *         description: Test ID
 *         required: true
 *         schema:
 *           type: string
 *         example: "API-T10-01"
 *     security:
 *       cookieAuth: []
 *     responses:
 *       '200':
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/testKB'
 *       '204':
 *         description: Success (no data)
 *       '400':
 *         description: Request failure (check inputs)
 *       '404':
 *         description: Not found (DB error)
 *     summary: Get data for a specific Test ID.
 *     tags:
 *       - TestKB
 */
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
    // TODO: Maybe send notFound(404) instead of noData(204) when op is OK but d says 0 record are applicable?
    // prettier-ignore
    db.test.findOne({where: {TID: req.params.TID}}).then((d) => {ok(op, res, d);}).catch((e) => {notFound(op, res, e);});
});

/**
 * @openapi
 * /api/testkb:
 *   post:
 *     request: {}
 *     security:
 *       cookieAuth: []
 *     responses:
 *       '201':
 *         description: Created
 *       '204':
 *         description: Success (no data)
 *       '400':
 *         description: Request failure (check inputs)
 *       '404':
 *         description: Not found (DB error)
 *     summary: Create a new test
 *     tags:
 *       - TestKB
 */
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

/**
 * @openapi
 * /api/testkb:
 *   put:
 *     request: {}
 *     security:
 *       cookieAuth: []
 *     responses:
 *       '200':
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               properties: {}
 *               type: object
 *       '204':
 *         description: Success (no data)
 *       '400':
 *         description: Request failure (check inputs)
 *       '404':
 *         description: Not found (DB error)
 *     summary: Update an existing test
 *     tags:
 *       - TestKB
 */
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

/**
 * @openapi
 * /api/issue:
 *   get:
 *     request:
 *     security:
 *       cookieAuth: []
 *     responses:
 *       '200':
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                  $ref: '#/components/schemas/issue'
 *       '204':
 *         description: Success (no data)
 *       '404':
 *         description: Not found (DB error)
 *     summary: Get all issues for all projects
 *     tags:
 *       - Issue
 */
app.get("/api/issue", (req, res) => {
    logger.info("Incoming issues search request");
    const op = "get-all-issues";
    // prettier-ignore
    db.issue.findAll().then((d)=>{ok(op, res, d);}).catch((e)=>{notFound(op, res, e);});
});

/**
 * @openapi
 * /api/issue/{PrjName}:
 *   get:
 *     parameters:
 *       - name: PrjName
 *         in: path
 *         description: Project Name
 *         required: true
 *         schema:
 *           type: string
 *         example: "20211201-MyApp-QA"
 *     security:
 *       cookieAuth: []
 *     responses:
 *       '200':
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                  $ref: '#/components/schemas/issue'
 *       '204':
 *         description: Success (no data)
 *       '400':
 *         description: Request failure (check inputs)
 *       '404':
 *         description: Not found (DB error)
 *     summary: Get all issues for a specific project.
 *     tags:
 *       - Issue
 */
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

/**
 * @openapi
 * /api/issue/{PrjName}:
 *   delete:
 *     parameters:
 *       - name: PrjName
 *         in: path
 *         description: Project Name
 *         required: true
 *         schema:
 *           type: string
 *         example: "20211201-MyApp-QA"
 *     security:
 *       cookieAuth: []
 *     responses:
 *       '200':
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               properties: {}
 *               type: object
 *       '204':
 *         description: Success (no data)
 *       '400':
 *         description: Request failure (check inputs)
 *       '404':
 *         description: Not found (DB error)
 *     summary: Delete all issues in a project.
 *     tags:
 *       - Issue
 */
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

/**
 * @openapi
 * /api/issue/{PrjName}/{TID}:
 *   put:
 *     parameters:
 *       - name: PrjName
 *         in: path
 *         description: Project Name
 *         required: true
 *         schema:
 *           type: string
 *         example: "20211201-MyApp-QA"
 *       - name: TID
 *         in: path
 *         description: Test ID
 *         required: true
 *         schema:
 *           type: string
 *         example: "API-T10-01"
 *     security:
 *       cookieAuth: []
 *     responses:
 *       '200':
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/issue'
 *       '204':
 *         description: Success (no data)
 *       '400':
 *         description: Request failure (check inputs)
 *       '404':
 *         description: Not found (DB error)
 *     summary: Create/update an issue
 *     tags:
 *       - Issue
 */
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
    db.issue.upsert(bodyData)
        .then((d) => {ok(op, res, d);}).catch((e) => {notFound(op, res, e);});
});

/**
 * @openapi
 * /api/issue/{PrjName}/todos:
 *   post:
 *     parameters:
 *       - name: PrjName
 *         in: path
 *         description: Project Name
 *         required: true
 *         schema:
 *           type: string
 *         example: "20211201-MyApp-QA"
 *     security:
 *       cookieAuth: []
 *     responses:
 *       '201':
 *         description: Created
 *       '204':
 *         description: Success (no data)
 *       '400':
 *         description: Request failure (check inputs)
 *       '404':
 *         description: Not found (DB error)
 *     summary: Create issue TODOs for a given project.
 *     tags:
 *       - Issue
 */
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

/**
 * @openapi
 * /api/issue/{PrjName}/{TID}:
 *   delete:
 *     parameters:
 *       - name: PrjName
 *         in: path
 *         description: Project Name
 *         required: true
 *         schema:
 *           type: string
 *         example: "20211201-MyApp-QA"
 *       - name: TID
 *         in: path
 *         description: Test ID
 *         required: true
 *         schema:
 *           type: string
 *         example: "API-T10-01"
 *     security:
 *       cookieAuth: []
 *     responses:
 *       '200':
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               properties: {}
 *               type: object
 *       '204':
 *         description: Success (no data)
 *       '400':
 *         description: Request failure (check inputs)
 *       '404':
 *         description: Not found (DB error)
 *     summary: Delete an issue.
 *     tags:
 *       - Issue
 */
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

/**
 * @openapi
 * /api/cwe:
 *   get:
 *     description: 'Get all CWEs'
 *     operationId: get-api-cwe
 *     parameters: []
 *     security:
 *       cookieAuth: []
 *     responses:
 *       '200':
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                  $ref: '#/components/schemas/cwe'
 *       '204':
 *         description: Success (no data)
 *       '404':
 *         description: Not found (DB error)
 *     summary: Get CWE list
 *     tags:
 *       - CWE
 */
app.get("/api/cwe", (req, res) => {
    logger.info("Incoming CWEs search request");
    const op = "get-cwes";

    // prettier-ignore
    db.cwe.findAll().then((d) => {ok(op, res, d);}).catch((e) => {notFound(op, res, e);});
});

/**
 * @openapi
 * /api/cwe/{CweId}:
 *   get:
 *     description: 'Get data for a CWE'
 *     operationId: get-api-cwe-285
 *     parameters:
 *       - name: CweId
 *         in: path
 *         description: ID of CWE to return
 *         required: true
 *         schema:
 *           type: integer
 *         example: 6
 *     security:
 *       cookieAuth: []
 *     responses:
 *       '200':
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/cwe'
 *       '204':
 *         description: Success (no data)
 *       '400':
 *         description: Request failure (check inputs)
 *       '404':
 *         description: Not found (DB error)
 *     summary: Get data for a CWE.
 *     tags:
 *       - CWE
 */
app.get("/api/cwe/:CweId", check("CweId").isInt(validationValues.CweId.isInt), (req, res) => {
    logger.info("Incoming CWE search request");
    const op = "get-cwe";

    // prettier-ignore
    db.cwe.findOne({where: {CweId: req.params.CweId}}).then((d) => {ok(op, res, d);})
        .catch((e) => {notFound(op, res, e);});
});

/**
 * @openapi
 * /api/{PrjName}/tests:
 *   get:
 *     description: 'Get applicable tests for a project'
 *     operationId: get-project-tests
 *     parameters:
 *       - name: PrjName
 *         in: path
 *         description: Project name
 *         required: true
 *         schema:
 *           type: string
 *         example: "20211201-MyApp-QA"
 *     security:
 *       cookieAuth: []
 *     responses:
 *       '200':
 *         description: Success
 *         content:
 *           application/json:
 *       '204':
 *         description: Success (no data)
 *       '400':
 *         description: Request failure (check inputs)
 *       '404':
 *         description: Not found (DB error)
 *     summary: Get applicable tests for a project.
 *     tags:
 *       - Project
 */
app.get("/api/:PrjName/tests", check("PrjName").matches(validationValues.PrjName.matches), (req, res) => {
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
                        // TODO: determine if this is the right response?
                        failure("findall-scoped-tests", res, err);
                    });
            })
            .catch((err) => {
                logger.warn(`Failed getting testing page data (in project search): ${JSON.stringify(err)}`);
                // TODO: determine if this is the right response?
                failure("findone-project", res, err);
            });
});

// ======================================= EXPORT/REPORT ROUTES =======================================
app.all("/export/*", ensureAuthenticated, ensureAuthorized, function (req, res, next) {
    next();
});

// Export all issues for all projects in CSV
//app.get("/export/issues.csv", reporting.exportIssuesCSV);

/**
 * @openapi
 * /export/csv/{PrjName}:
 *   get:
 *     parameters:
 *       - name: PrjName
 *         in: path
 *         description: Project Name
 *         required: true
 *         schema:
 *           type: string
 *         example: "20211201-MyApp-QA"
 *     security:
 *       cookieAuth: []
 *     responses:
 *       '200':
 *         description: Success
 *         content:
 *           text/csv:
 *       '204':
 *         description: Success (no data)
 *       '400':
 *         description: Request failure (check inputs)
 *       '404':
 *         description: Not found (DB error)
 *     summary: Export all issues for a specific project in CSV.
 *     tags:
 *       - Reporting
 */
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

/**
 * @openapi
 * /export/json/{PrjName}:
 *   get:
 *     parameters:
 *       - name: PrjName
 *         in: path
 *         description: Project Name
 *         required: true
 *         schema:
 *           type: string
 *         example: "20211201-MyApp-QA"
 *     security:
 *       cookieAuth: []
 *     responses:
 *       '200':
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               properties: {}
 *               type: object
 *       '204':
 *         description: Success (no data)
 *       '400':
 *         description: Request failure (check inputs)
 *       '404':
 *         description: Not found (DB error)
 *     summary: Export all issues for a specific project in JSON.
 *     tags:
 *       - Reporting
 */
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

/**
 * @openapi
 * /export/html/findings/{PrjName}:
 *   get:
 *     parameters:
 *       - name: PrjName
 *         in: path
 *         description: Project Name
 *         required: true
 *         schema:
 *           type: string
 *         example: "20211201-MyApp-QA"
 *     security:
 *       cookieAuth: []
 *     responses:
 *       '200':
 *         description: Success
 *         content:
 *           text/html:
 *       '204':
 *         description: Success (no data)
 *       '400':
 *         description: Request failure (check inputs)
 *       '404':
 *         description: Not found (DB error)
 *     summary: Generate a Findings Report for a project in HTML.
 *     tags:
 *       - Reporting
 */
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

/**
 * @openapi
 * /export/html/full/{PrjName}:
 *   get:
 *     parameters:
 *       - name: PrjName
 *         in: path
 *         description: Project Name
 *         required: true
 *         schema:
 *           type: string
 *         example: "20211201-MyApp-QA"
 *     security:
 *       cookieAuth: []
 *     responses:
 *       '200':
 *         description: Success
 *         content:
 *           text/html:
 *       '204':
 *         description: Success (no data)
 *       '400':
 *         description: Request failure (check inputs)
 *       '404':
 *         description: Not found (DB error)
 *     summary: Generate a Full Report for a project in HTML.
 *     tags:
 *       - Reporting
 */
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
    // HTTP STATUS: 500 Internal Server Error - The server encountered an unexpected condition which prevented it from fulfilling the request.
    // TODO: Toggle comments on below 3 lines for security (eventually)
    //res.sendStatus(500);
    res.status(500).send({error: msg, additionalInfo: "Caught by global exception handler."});
});

// Our custom JSON 404 middleware. Since it's placed last it will be the last middleware called,
// if all others invoke next() and do not respond.
app.use(function (req, res) {
    // HTTP STATUS: 404 Not Found - The server can not find the requested resource.
    res.status(404).send({Error: "This request is unsupported!"});
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

// ======================================= HTTP RESPONSE FUNCTIONS ========================================
// Using definitions from: https://restfulapi.net/http-status-codes/ (HTTP STATUS comments)

// created(): used when post/creation requests succeed
function created(op, res, data) {
    if (data) {
        logger.info(`Creation succeeded for ${op} - resulting data: ${JSON.stringify(data)}`);
        // HTTP STATUS: 201 Created - Indicates that the request has succeeded and a new resource has been created as a result.
        //res.sendStatus(201);
        res.status(201).send(data);
    } else {
        logger.warn(`Request succeeded. No data`);
        // HTTP STATUS: 204 No Content - The server has fulfilled the request but does not need to return a response body. The server may return the updated meta information.
        //res.sendStatus(204);
        res.status(204).send("TODO: check if this 204 happens in normal situations or if a 4XX should be returned instead");
    }
}

// ok(): used when any DB request succeeds, even if the client expects a different result
function ok(op, res, data) {
    if (data) {
        logger.info(`Request succeeded for ${op}: ${JSON.stringify(data)}`);
        if (typeof data === "number") data = `Value: ${data}`;
        // HTTP STATUS: 200 OK - Indicates that the request has succeeded.
        //res.sendStatus(200);
        res.status(200).send(data);
    } else {
        logger.info(`Request succeeded for ${op}. No data`);
        // HTTP STATUS: 204 No Content - The server has fulfilled the request but does not need to return a response body. The server may return the updated meta information.
        //res.sendStatus(204);
        res.status(204).send("TODO: check if 4XX should be sent instead (e.g. 404 not found). Does returned data say 0 record applicable? If not a GET should we using another response code?");
    }
}

// failure(): used on input validation issues
function failure(op, res, err) {
    logger.error(`Request failed for ${op}: ${JSON.stringify(err)}`);
    // HTTP STATUS: 400 Bad Request - The request could not be understood by the server due to incorrect syntax. The client SHOULD NOT repeat the request without modifications.
    //res.sendStatus(400);
    res.status(400).send(err);
}

// notFound(): used when DB requests fail
// TODO: check traffic if 404 appears adequate in all situations observed
function notFound(op, res, err) {
    logger.warn(`Could not find data for ${op}: ${JSON.stringify(err.message)}`);
    // HTTP STATUS: 404 Not Found - The server can not find the requested resource.
    // TODO: Toggle comments on below two lines for security (eventually)
    //res.sendStatus(404);
    res.status(404).send(err.message);
}
