// Load .env file
require("dotenv").config();
const express = require("express");
const session = require("express-session");
//const exphbs = require("express-handlebars");
const passport = require("passport");
const path = require("path");
const favicon = require("serve-favicon");
const logger = require("./lib/appLogger.js");
const reqLogger = require("./lib/reqLogger.js");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const fs = require("fs");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const GitHubStrategy = require("passport-github").Strategy;
const config = require("./config.js");
const {check, checkSchema, validationResult} = require("express-validator");
const validationSchema = require("./validationSchema.js");
const validationValues = require("./validationValues.js");
const prjRes = require("./ProjectRes.js");
const testkbRes = require("./TestKBRes.js");
const issueRes = require("./IssueRes.js");
const cweRes = require("./CweRes.js");
const reporting = require("./reporting.js");
const spdy = require("spdy");
const {exec, execFile} = require("child_process");
const useHttp2 = false;

// ========================================== CONSTANTS ==========================================
const dbinit_dir = "/app/dbinit/waptrunner";

// ========================================== GET CONFIG ==========================================
const port = process.env.PORT || config.port;
const mongodbUrl = process.env.MONGODB_URL || config.mongodbUrl;
const authMode = process.env.AUTH_MODE || config.defaultAuthMode;
let oauthConfig = {};
let users = [];
if (authMode == config.AUTH_MODE_OAUTH) {
    logger.info("Configuring app with OAuth");
    oauthConfig.github = {};
    oauthConfig.google = {};
    oauthConfig.github.client_id = process.env.GITHUB_CLIENT_ID;
    oauthConfig.github.client_secret = process.env.GITHUB_CLIENT_SECRET;
    oauthConfig.github.redirect_uri = process.env.GITHUB_REDIRECT_URI;
    oauthConfig.google.client_id = process.env.GOOGLE_CLIENT_ID;
    oauthConfig.google.client_secret = process.env.GOOGLE_CLIENT_SECRET;
    oauthConfig.google.redirect_uri = process.env.GOOGLE_REDIRECT_URI;
    let usersConfig = process.env.USERLIST;
    let userConfig = usersConfig.split(":");
    for (let i in userConfig) {
        let ava = userConfig[i].split(",");
        let user = {};
        for (let j in ava) {
            let [at, val] = ava[j].split("=");
            user[at] = val;
        }
        //user.projects = [".*"];
        users.push(user);
    }
} else {
    logger.info("App starting without authentication for dev/testing purposes");
}

//logger.debug(`Validation Schema: ${JSON.stringify(validationSchema)}`);
//logger.debug(`Validation Values: ${JSON.stringify(validationValues)}`);

// ========================================== PASSPORT ==========================================
// Passport session setup.
if (authMode == config.AUTH_MODE_OAUTH) {
    passport.serializeUser(function (user, done) {
        logger.debug(`Serializing user ${user.username}`);
        done(null, user);
    });

    passport.deserializeUser(function (obj, done) {
        logger.silly(`Deserialized user ID ${obj.id} from provider ${obj.provider}`);
        done(null, obj);
    });

    passport.use(
        new GoogleStrategy(
            {
                clientID: oauthConfig.google.client_id,
                clientSecret: oauthConfig.google.client_secret,
                callbackURL: oauthConfig.google.redirect_uri,
                passReqToCallback: true,
            },
            function (request, accessToken, refreshToken, profile, cb) {
                return cb(null, profile);
                /*
                User.findOrCreate({ googleId: profile.id }, function (err, user) {
                return done(err, user);
                }); */
            }
        )
    );

    passport.use(
        new GitHubStrategy(
            {
                clientID: oauthConfig.github.client_id,
                clientSecret: oauthConfig.github.client_secret,
                callbackURL: oauthConfig.github.redirect_uri,
            },
            function (accessToken, refreshToken, profile, cb) {
                return cb(null, profile);
                /*
                User.findOrCreate({ githubId: profile.id }, function (err, user) {
                return cb(err, user); });
                */
            }
        )
    );
}

// Simple route middleware to ensure user is authenticated.
function ensureAuthenticated(req, res, next) {
    if (authMode == config.AUTH_MODE_NONE) return next();
    if (req.isAuthenticated()) {
        return next();
    }
    // logger.info(`User is not authenticated (authMode=${authMode}), redirecting to login`);
    //req.session.error = "Please sign in!";
    //res.redirect("/login");
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
        //logger.warn(`User ${id} is NOT authorized.`);
        //req.session.error = "User ID " + id + " is not Authorized!";
        //res.redirect("/login");
        logger.warn(`Client is not authorized (authMode=${authMode}), sending 401`);
        res.status(401).send("Not Authorized.");
    } else {
        logger.info(`User ${id} is authorized`);
        return next();
    }
}

// Build filter for scope query
function getScopeQuery(prj) {
    logger.debug(`Building scope query from scope query ${prj.scopeQry}`);
    let scopeQuery = {};
    let PciTests = prj.PciTests;
    let Top10Tests = prj.Top10Tests;
    let Top25Tests = prj.Top25Tests;
    let StdTests = prj.StdTests;
    let TTestNameKeyword = prj.TTestNameKeyword;
    let TCweIDSearch = prj.TCweIDSearch;

    // Build scope query
    switch (prj.scopeQry) {
        case "All":
            scopeQuery = {};
            break;
        case "API":
            scopeQuery = {
                $or: [
                    {TTestName: {$regex: "^API"}},
                    {TTestName: {$regex: " API"}},
                    {TTestName: {$regex: "REST"}},
                    {TTestName: {$regex: "SOAP"}},
                    {TTestName: {$regex: "AJAX"}},
                    {TTestName: {$regex: "RPC"}},
                    {TType: {$regex: "^API"}},
                    {TIssueName: {$regex: "^API"}},
                    {TIssueName: {$regex: " API"}},
                    {TSource: {$regex: "API"}},
                    {TSection: {$regex: "^API"}},
                ],
            };
            break;
        case "Default":
            scopeQuery = {
                $or: [{TSource: "OWASP-WSTG"}, {TSource: "WAHH2"}, {TSource: "TBHM2015"}, {TSource: "Extras"}],
            };
            break;
        case "BCVRT":
        case "Extras":
        case "TBHM2015":
        case "OWASP-API-T10":
        case "OWASP-ASVS":
        case "OWASP-TG4":
        case "OWASP-WSTG":
        case "SEC542":
        case "SEC642":
        case "WAHH2":
        case "WebSvc":
        case "CWE-Top-25":
            scopeQuery = {TSource: prj.scopeQry};
        //scopeQuery = { $or: [ { TSource: prj.scopeQry }, { TSource: "Extras" }, ], };
    }
    logger.debug(`Scope without filtering: ${JSON.stringify(scopeQuery)}`);

    let useTestNameKeyword = false;
    if (TTestNameKeyword !== undefined && TTestNameKeyword !== null && TTestNameKeyword.length > 0) useTestNameKeyword = true;

    let useTCweIDSearch = false;
    if (TCweIDSearch !== undefined && TCweIDSearch !== null && TCweIDSearch.length > 0) useTCweIDSearch = true;

    if (PciTests || Top10Tests || Top25Tests || StdTests || useTestNameKeyword || useTCweIDSearch) {
        let filter = {};
        if (PciTests) filter = JSON.stringify(filter).length <= 2 ? {TPCI: PciTests} : {$or: [filter, {TPCI: PciTests}]};
        if (Top10Tests) filter = JSON.stringify(filter).length <= 2 ? {TTop10: Top10Tests} : {$or: [filter, {TTop10: Top10Tests}]};
        if (Top25Tests) filter = JSON.stringify(filter).length <= 2 ? {TTop25: Top25Tests} : {$or: [filter, {TTop25: Top25Tests}]};
        if (StdTests) filter = JSON.stringify(filter).length <= 2 ? {TStdTest: StdTests} : {$or: [filter, {TStdTest: StdTests}]};
        if (useTestNameKeyword)
            filter =
                JSON.stringify(filter).length <= 2
                    ? {TTestName: {$regex: TTestNameKeyword}}
                    : {
                          $and: [filter, {TTestName: {$regex: TTestNameKeyword}}],
                      };
        if (useTCweIDSearch) filter = JSON.stringify(filter).length <= 2 ? {TCweID: TCweIDSearch} : {$or: [filter, {TCweID: TCweIDSearch}]};

        scopeQuery = {$and: [scopeQuery, filter]};
    }
    return scopeQuery;
}

// ========================================== EXPRESS ==========================================
// Configure Express
let app = express();
app.disable("x-powered-by");
app.use(reqLogger);
app.use(cookieParser());
app.use(bodyParser.json({limit: "5mb"}));
app.use(bodyParser.urlencoded({extended: true, limit: "5mb"}));
app.use(bodyParser.text());
app.use(methodOverride());
app.use(session(config.session));
app.use(passport.initialize());
if (authMode == config.AUTH_MODE_OAUTH) app.use(passport.session());
// Disable caching during some testing
app.disable("etag");

// !!!IMPORTANT: place this before static or similar middleware
// directory is where markdown files are stored
app.use(require("./lib/express-markdown")({directory: path.join(__dirname, "../doc")}));

// Serve favicon and static content
let staticOptions = {
    //dotfiles: 'ignore',
    // etag: false,
    extensions: ["htm", "html"],
    index: false,
    maxAge: "1d",
    redirect: false,
    setHeaders: function (res, path, stat) {
        res.set("x-timestamp", Date.now());
    },
};
app.use(favicon(path.join(__dirname, "../client", "favicon.ico")));
app.use(express.static(path.join(__dirname, "../client"), staticOptions));
app.use("/screenshots", express.static(path.join(__dirname, "../doc/screenshots/")));

// Serve jquery npm module content to clients.  NOTE: make sure client source fiels use: <script src="/jquery/jquery.js"></script>
app.use("/dist/bootstrap", express.static(path.join(__dirname, "../node_modules/bootstrap/dist/")));
app.use("/dist/jquery", express.static(path.join(__dirname, "../node_modules/jquery/dist/")));
app.use("/dist/lodash", express.static(path.join(__dirname, "../node_modules/lodash/")));
app.use("/dist/handlebars", express.static(path.join(__dirname, "../node_modules/handlebars/dist/")));
app.use("/dist/reactive-handlebars", express.static(path.join(__dirname, "../reactive-handlebars/src/")));

// Serve private static content
app.use("/static", express.static(path.join(__dirname, "../waptrun-static/")));

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

// ========================================== HANDLEBARS ==========================================
// Configure express to use handlebars templates
/*
let hbs = exphbs.create({
    defaultLayout: "main",
    extname: ".hbs",
});
app.engine(".hbs", hbs.engine);
app.set("view engine", ".hbs");
*/

// ========================================== DATABASE ==========================================
// Make our db accessible to our router
const monk = require("monk");
const {exit} = require("process");
const {logging} = require("./config.js");
const mongoURL = new URL(mongodbUrl);
logger.info(`Connecting to MongoDB server at ${mongoURL.host}`);
const db = monk(mongodbUrl);

// Check DB connection
db.then(() => {
    logger.info("Connected successfully to mongodb server");

    // Initialize the database when empty
    let prjColl = db.get("project");
    let testkbColl = db.get("testkb");
    let issuesColl = db.get("issues");
    let cweColl = db.get("cwe");

    prjColl.count().then((count1) => {
        testkbColl.count().then((count2) => {
            issuesColl.count().then((count3) => {
                cweColl.count().then((count4) => {
                    let total = count1 + count2 + count3 + count4;
                    if (total <= 0) {
                        logger.info("Loading initial data set into our empty Mongodb (adding CWEs, Test KB...)");
                        execFile("/usr/bin/mongorestore", ["--db=waptrunner", "--drop", "--host", mongoURL.host, dbinit_dir], (error, stdout, stderr) => {
                            if (error) {
                                throw error;
                            }
                            logger.debug(`Mongorestore stdout: ${stdout}`);
                            logger.debug(`Mongorestore stderr: ${stderr}`);
                        });
                    } else logger.info(`Mongodb contains ${total} records total`);
                });
            });
        });
    });
}).catch((err) => {
    logger.error("Mongodb connection error:", err);
    exit(1);
});

app.use(function (req, res, next) {
    req.db = db;
    next();
});

// ============================== GOOGLE AUTH ROUTES ==========================================
if (authMode == config.AUTH_MODE_OAUTH) {
    app.get(
        "/auth/google",
        passport.authenticate("google", {
            scope: ["https://www.googleapis.com/auth/plus.login"],
        })
    );

    app.get("/auth/google/callback", passport.authenticate("google", {failureRedirect: "/login"}), function (req, res) {
        // Successful authentication, redirect home.
        //res.redirect("/");
        res.redirect("/home");
    });
}

// ============================== GITHUB AUTH ROUTES ==========================================
if (authMode == config.AUTH_MODE_OAUTH) {
    app.get("/auth/github", passport.authenticate("github"));

    app.get("/auth/github/callback", passport.authenticate("github", {failureRedirect: "/login"}), function (req, res) {
        // Successful authentication, redirect home.
        res.redirect("/home");
    });
}

// ========================================== WEB APP ROUTES ==========================================
// Logout
if (authMode == config.AUTH_MODE_NONE) {
    app.get("/", function (req, res) {
        res.redirect("/home");
    });
    app.get("/login", function (req, res) {
        res.redirect("/home");
    });
    app.get("/logout", function (req, res) {
        res.redirect("/home");
    });
    /*
    app.get("/account", function (req, res) {
        res.redirect("/");
    });
    */
} else {
    app.get("/", ensureAuthenticated, ensureAuthorized, function (req, res) {
        res.redirect("/home");
    });
    app.get("/logout", function (req, res) {
        req.logout();
        res.redirect("/login");
        //req.session.notice = "You have successfully been logged out " + name + "!";
    });

    /*
    // Display login page
    app.get("/login", function (req, res) {
        res.render("login");
    });

    // Show account information
    app.get("/account", ensureAuthenticated, ensureAuthorized, function (req, res) {
        res.render("account", {user: req.user});
    });
    */
}

// Home
/*
app.get("/", ensureAuthenticated, ensureAuthorized, function (req, res) {
    // Get user info
    let user = authMode == config.AUTH_MODE_NONE ? config.LOCAL_USER : req.user;
    if (authMode == config.AUTH_MODE_OAUTH) logger.debug(`Logged in. User ID ${req.user.id} from provider ${req.user.provider}`);

    // Fetch from project collection
    let prjColl = db.get("project");
    let testkbColl = db.get("testkb");
    let issuesColl = db.get("issues");
    let cweColl = db.get("cwe");
    let sortName = {name: -1};
    let prjRegex = {$regex: config.PrjSubset};
    let prjSubset = {name: prjRegex};

    // Print the count of records
    prjColl.count().then((count) => {
        logger.debug(`Count of documents in collection "project": ${count}`);
    });
    testkbColl.count().then((count) => {
        logger.debug(`Count of documents in collection "testkb": ${count}`);
    });
    issuesColl.count().then((count) => {
        logger.debug(`Count of documents in collection "issues": ${count}`);
    });
    cweColl.count().then((count) => {
        logger.debug(`Count of documents in collection "cwe": ${count}`);
    });

    logger.info("Searching for projects");
    prjColl.find(prjSubset, {sort: sortName}).then((projects) => {
        logger.info("Rendering home page");
        res.render("home", {
            user: user,
            TestRefBase: config.TestRefBase,
            projects: projects,
        });
    });
});

// Show Project page
app.get(
    "/project/:PrjName",
    ensureAuthenticated,
    ensureAuthorized,
    // check for pattern YYYYMM[DD]-PrjName-EnvName
    check("PrjName").matches(validationValues.PrjName.matches),
    function (req, res) {
        // Check for input validation errors in the request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()});
        }

        // Get user info
        let user = authMode == config.AUTH_MODE_NONE ? config.LOCAL_USER : req.user;

        // Fetch from project collection
        let prjColl = db.get("project");
        let prjRegex = {$regex: config.PrjSubset};
        let prjSubset = {name: prjRegex};
        logger.info(`Checking if entry exists for project ${req.params.PrjName}`);
        prjColl.findOne({$and: [{name: req.params.PrjName}, prjSubset]}, function (e, prj) {
            logger.info(`Rendering project page for user ${user}`);
            res.render("project", {
                user: user,
                CveRptBase: config.CveRptBase,
                CveRptSuffix: config.CveRptSuffix,
                prj: prj,
            });
        });
    }
);

// Show Testing Runner page
app.get(
    "/testing/:PrjName",
    ensureAuthenticated,
    ensureAuthorized,
    // Check for pattern YYYYMM[DD]-PrjName-EnvName
    check("PrjName").matches(validationValues.PrjName.matches),
    function (req, res) {
        // Check for input validation errors in the request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()});
        }

        // Get user info
        let user = authMode == config.AUTH_MODE_NONE ? config.LOCAL_USER : req.user;

        // Fetch from project collection
        let prjRegex = {$regex: config.PrjSubset};
        let prjSubset = {name: prjRegex};
        let prjColl = db.get("project");
        logger.debug(`Checking if entry exists for project ${req.params.PrjName}`);
        prjColl.findOne({$and: [{name: req.params.PrjName}, prjSubset]}, function (e, prj) {
            if (prj === null) return;

            // Get scope query
            let scopeQuery = getScopeQuery(prj);

            // Search the Test KB for matching tests
            logger.debug("Searching TestKB with scope query ", scopeQuery);
            let testKB = db.get("testkb");
            let issuesColl = db.get("issues");
            let cweColl = db.get("cwe");
            testKB.find(scopeQuery, {sort: {TID: 1}}, function (_e, tests) {
                // Search issues collection for matching issues
                issuesColl.find({PrjName: req.params.PrjName}, {sort: {IPriority: 1, TID: 1}}, function (__e, issues) {
                    // Get sorted list of CWEs
                    cweColl.find({}, {sort: {ID: 1}}, function (___e, cwes) {
                        res.render("testing", {
                            user: user,
                            prj: prj,
                            tests: tests,
                            issues: issues,
                            cwes: cwes,
                            CweUriBase: config.CweUriBase,
                            CveRptBase: config.CveRptBase,
                            CveRptSuffix: config.CveRptSuffix,
                            TestRefBase: config.TestRefBase,
                            ScopeQuery: JSON.stringify(scopeQuery),
                        });
                    });
                });
            });
        });
    }
);
*/

// ========================================== REST ROUTES ==========================================

// Check if authenticated/authorized to use the REST API
app.all("/api/*", ensureAuthenticated, ensureAuthorized, function (req, res, next) {
    next();
});

// Backup DB
app.post("/api/db/backup", (req, res, next) => {
    logger.info(`Backing-up database...`);
    exec("/app/utils/backup.sh", (error, stdout, stderr) => {
        if (error) {
            msg = `Error when backing-up DB: ${error}`;
            console.error(msg);
            res.status(404).json({error: JSON.stringify(msg)});
        }
        let msg = {stdout: stdout, stderr: stderr};
        logger.info(`Backup result: ${JSON.stringify(msg)}`);
        res.json(msg);
    });
});

// Show account info
app.get("/api/account", function (req, res) {
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
app.get("/api/project", prjRes.findAll);

// Get project data
app.get(
    "/api/project/:name",
    // check for pattern YYYYMM[DD]-PrjName-EnvName
    check("name").matches(validationValues.PrjName.matches),
    prjRes.findByName
);

// Create project
app.post("/api/project", checkSchema(validationSchema.project), prjRes.create);

// Update project
app.put("/api/project/:name", checkSchema(validationSchema.project), prjRes.update);

// Delete project
app.delete(
    "/api/project/:name",
    // check for pattern YYYYMM[DD]-PrjName-EnvName
    check("name").matches(validationValues.PrjName.matches),
    prjRes.removeByName
);

// Get data for all tests
app.get("/api/testkb", testkbRes.findAll);

// Get data for a specific Test ID
app.get(
    "/api/testkb/:TID",
    // check for allowable TID chars (letters, numbers, dash, dots)
    check("TID").matches(validationValues.TID.matches),
    testkbRes.findByTID
);

// Create a new test
app.post(
    "/api/testkb",
    checkSchema(validationSchema.testKB),
    testkbRes.create // filtering out additional fields that aren't in the schema happens here
);

// Update an existing test
app.put("/api/testkb/:TID", checkSchema(validationSchema.testKB), testkbRes.update);

// Get all issues for all projects
app.get("/api/issue", issueRes.findAll);

// Get all issues for a specific project
app.get(
    "/api/issue/:PrjName",
    // check for pattern YYYYMM[DD]-PrjName-EnvName
    check("PrjName").matches(validationValues.PrjName.matches),
    issueRes.findProjectIssues
);

// Delete all issues in a project
app.delete(
    "/api/issue/:PrjName",
    // check for pattern YYYYMM[DD]-PrjName-EnvName
    check("PrjName").matches(validationValues.PrjName.matches),
    issueRes.removeAllForPrj
);

// Create/update an issue
app.put("/api/issue/:PrjName/:TID", checkSchema(validationSchema.issue), issueRes.upsert);

// Create issue TODOs for a given project
app.post(
    "/api/issue/:PrjName/todos",
    // Check for pattern YYYYMM[DD]-PrjName-EnvName
    check("PrjName").matches(validationValues.PrjName.matches),
    function (req, res) {
        // Check for input validation errors in the request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()});
        }

        // Fetch from project collection
        let prjRegex = {$regex: config.PrjSubset};
        let prjSubset = {name: prjRegex};
        let prjColl = db.get("project");
        logger.debug(`Checking if entry exists for project ${req.params.PrjName}`);
        prjColl.findOne({$and: [{name: req.params.PrjName}, prjSubset]}, function (e, prj) {
            if (prj === null) return;

            // Get scope query
            let scopeQuery = getScopeQuery(prj);

            // Search the Test KB for matching tests
            logger.info("Searching TestKB with scope query ", scopeQuery);
            let testKB = db.get("testkb");
            testKB.find(scopeQuery, {sort: {TID: 1}}, function (_e, tests) {
                issueRes.createTodos(req, res, tests);
            });
        });
    }
);

// Delete an issue
app.delete(
    "/api/issue/:PrjName/:TID",
    // check for pattern YYYYMM[DD]-PrjName-EnvName
    check("PrjName").matches(validationValues.PrjName.matches),
    // check for allowable TID chars (letters, numbers, dash, dots)
    check("TID").matches(validationValues.TID.matches),
    issueRes.removeByName
);

// Get data for an issue
app.get(
    "/api/issue/:PrjName/:TID",
    // check for allowable TID chars (letters, numbers, dash, dots)
    check("PrjName").matches(validationValues.PrjName.matches),
    check("TID").matches(validationValues.TID.matches),
    issueRes.findIssue
);

// Get list of CWEs
app.get("/api/cwe", cweRes.findAll);

// Get data for a CWE
app.get(
    "/api/cwe/:id",
    // check CWE ID
    check("id").isInt(validationValues.CweId.isInt),
    cweRes.findById
);

// Get testing data for a project
app.get(
    "/api/testing/:PrjName",
    // Check for pattern YYYYMM[DD]-PrjName-EnvName
    check("PrjName").matches(validationValues.PrjName.matches),
    function (req, res) {
        // Check for input validation errors in the request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            logger.warn("Input validation failed for project name");
            return res.status(422).json({errors: errors.array()});
        }

        // Fetch from project collection
        let prjRegex = {$regex: config.PrjSubset};
        let prjSubset = {name: prjRegex};
        let prjColl = db.get("project");
        logger.debug(`Checking if entry exists for project ${req.params.PrjName}`);
        prjColl
            .findOne({$and: [{name: req.params.PrjName}, prjSubset]})
            .then((prj) => {
                //if (prj === null) return;

                // Get scope query
                let scopeQuery = getScopeQuery(prj);

                // Search the Test KB for matching tests
                logger.debug("Searching TestKB with scope query ", scopeQuery);
                let testKB = db.get("testkb");
                let testKbFields = {TID: 1, _id: 1, TSource: 1, TTestName: 1};
                let issuesColl = db.get("issues");
                let cweColl = db.get("cwe");
                testKB
                    .find(scopeQuery, {sort: {TID: 1}, projection: testKbFields})
                    .then((tests) => {
                        const testingPageData = {
                            prj: prj,
                            tests: tests,
                            CweUriBase: config.CweUriBase,
                            CveRptBase: config.CveRptBase,
                            CveRptSuffix: config.CveRptSuffix,
                            TestRefBase: config.TestRefBase,
                            ScopeQuery: JSON.stringify(scopeQuery),
                        };
                        logger.info(`Returning testing page data for project ${req.params.PrjName}`);
                        res.json(testingPageData);
                    })
                    .catch((err) => {
                        logger.warn(`Failed getting testing page data (in tests search): ${JSON.stringify(err)}`);
                        res.status(404).json({error: JSON.stringify(err)});
                    });
            })
            .catch((err) => {
                logger.warn(`Failed getting testing page data (in project search): ${JSON.stringify(err)}`);
                res.status(404).json({error: JSON.stringify(err)});
            });
    }
);

// ======================================= EXPORT/REPORT ROUTES =======================================
// Check if authenticated/authorized to export data
app.all("/export/*", ensureAuthenticated, ensureAuthorized, function (req, res, next) {
    next();
});

// Export all issues for all projects in CSV
app.get("/export/issues.csv", reporting.exportIssuesCSV);

// Export all issues for a specific project in CSV
app.get(
    "/export/csv/:PrjName",
    // check for pattern YYYYMM[DD]-PrjName-EnvName
    check("PrjName").matches(validationValues.PrjName.matches),
    reporting.genPrjIssueReportCSV
);

// Export all issues for a specific project in JSON
app.get(
    "/export/json/:PrjName",
    // check for pattern YYYYMM[DD]-PrjName-EnvName
    check("PrjName").matches(validationValues.PrjName.matches),
    reporting.genPrjIssueExportJSON
);

// Generate a Findings Report for a project in HTML
app.get(
    "/export/html/findings/:PrjName",
    // check for pattern YYYYMM[DD]-PrjName-EnvName
    check("PrjName").matches(validationValues.PrjName.matches),
    reporting.genPrjIssueFindingsReportHtml
);

// Generate a Full Report for a project in HTML
app.get(
    "/export/html/full/:PrjName",
    // check for pattern YYYYMM[DD]-PrjName-EnvName
    check("PrjName").matches(validationValues.PrjName.matches),
    reporting.genPrjIssueFullReportHtml
);

// ========================================== ERROR HANDLING ==========================================
// create an error with .status. we
// can then use the property in our
// custom error handler (Connect repects this prop as well)
function error(status, msg) {
    var err = new Error(msg);
    err.status = status;
    return err;
}

// middleware with an arity of 4 are considered
// error handling middleware. When you next(err)
// it will be passed through the defined middleware
// in order, but ONLY those with an arity of 4, ignoring
// regular middleware.
app.use(function (err, req, res, next) {
    // whatever you want here, feel free to populate
    // properties on `err` to treat it differently in here.
    res.status(err.status || 500);
    res.send({error: err.message});
});

// our custom JSON 404 middleware. Since it's placed last
// it will be the last middleware called, if all others
// invoke next() and do not respond.
app.use(function (req, res) {
    res.status(404);
    res.send({Error: "This request is unsupported!"});
});

// ========================================== START LISTENER ==========================================
if (useHttp2) {
    // Get key and cert to support HTTP/2
    const options = {
        key: fs.readFileSync(path.join(__dirname, "../data/privkey3.pem")),
        cert: fs.readFileSync(path.join(__dirname, "../data/cert3.pem")),
    };

    // Configure compression
    const shouldCompress = (req, res) => {
        // don't compress responses asking explicitly not
        if (req.headers["x-no-compression"]) {
            return false;
        }
        // use compression filter function
        return compression.filter(req, res);
    };
    // set up compression in express
    app.use(compression({filter: shouldCompress}));

    // Start HTTP/2 listener
    spdy.createServer(options, app).listen(port, (error) => {
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
