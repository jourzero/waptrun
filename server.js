// Load .env file
require("dotenv").config();

const express = require("express");
const session = require("express-session");
const exphbs = require("express-handlebars");
const passport = require("passport");
//const LocalStrategy = require('passport-local');
//const http = require('http');
const path = require("path");
const favicon = require("serve-favicon");
const logger = require("morgan");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
//const errorHandler = require('errorhandler');
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const GitHubStrategy = require("passport-github").Strategy;
const config = require("./config.js");
//const users = require("./users.js");
//const mongoAuth = require('./server/mongoAuth.js');
const {check, checkSchema, validationResult} = require("express-validator/check");
const validationSchema = require("./validationSchema.js");

// ========================================== GET CONFIG ==========================================
const port = process.env.PORT || config.port;
const mongodbUrl = process.env.MONGODB_URL || config.mongodbUrl;
let oauthConfig = {};
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
let users = [];
for (let i in userConfig) {
    let ava = userConfig[i].split(",");
    let user = {};
    for (let j in ava) {
        [at, val] = ava[j].split("=");
        user[at] = val;
    }
    //user.projects = [".*"];
    users.push(user);
}

//console.debug("OAuth config:", JSON.stringify(oauthConfig));
//console.debug("Users:", JSON.stringify(users));

// ========================================== PASSPORT ==========================================
// Passport session setup.
passport.serializeUser(function(user, done) {
    console.debug("serializing " + user.username);
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    console.debug("deserializing " + obj);
    done(null, obj);
});

// Use the LocalStrategy within Passport to login users.
/*
passport.use('local-signin', new LocalStrategy(
  {passReqToCallback : true}, //allows us to pass back the request to the callback
  function(req, username, password, done) {
    mongoAuth.localAuth(username, password)
    .then(function (user) {
      if (user) {
        console.log("LOGGED IN AS: " + user.username);
        req.session.success = 'You are successfully logged in ' + user.username + '!';
        done(null, user);
      }
      if (!user) {
        console.log("COULD NOT LOG IN");
        req.session.error = 'Could not log user in. Please try again.'; //inform user could not log them in
        done(null, user);
      }
    })
    .fail(function (err){
      console.log(err.body);
    });
  }
));
*/

passport.use(
    new GoogleStrategy(
        {
            clientID: oauthConfig.google.client_id,
            clientSecret: oauthConfig.google.client_secret,
            callbackURL: oauthConfig.google.redirect_uri,
            passReqToCallback: true
        },
        function(request, accessToken, refreshToken, profile, cb) {
            return cb(null, profile);
            /*
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return done(err, user);
    });
    */
        }
    )
);

passport.use(
    new GitHubStrategy(
        {
            clientID: oauthConfig.github.client_id,
            clientSecret: oauthConfig.github.client_secret,
            callbackURL: oauthConfig.github.redirect_uri
        },
        function(accessToken, refreshToken, profile, cb) {
            return cb(null, profile);
            /*
    User.findOrCreate({ githubId: profile.id }, function (err, user) {
      return cb(err, user);
    });
    */
        }
    )
);

// Use the LocalStrategy within Passport to Register/"signup" users.
/* TODO: Renable below later (maybe) */
/*
passport.use('local-signup', new LocalStrategy(
 {passReqToCallback : true}, //allows us to pass back the request to the callback
 function(req, username, password, done) {
   mongoAuth.localReg(username, password)
   .then(function (user) {
     if (user) {
       console.log("REGISTERED: " + user.username);
       req.session.success = 'You are successfully registered and logged in ' + user.username + '!';
       done(null, user);
     }
     if (!user) {
       console.log("COULD NOT REGISTER");
       req.session.error = 'That username is already in use, please try a different one.'; //inform user could not log them in
       done(null, user);
     }
   })
   .fail(function (err){
     console.log(err.body);
   });
 }
));
*/

// Simple route middleware to ensure user is authenticated.
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.session.error = "Please sign in!";
    //res.redirect('/signin');
    res.redirect("/login");
}

// Test authorization
function ensureAuthorized(req, res, next) {
    let id = req.user.id;
    let provider = req.user.provider;
    console.debug(
        "Ensuring that user",
        id,
        "from provider",
        provider,
        "is authorized. User data = ",
        JSON.stringify(req.user)
    );
    let user = users.find(usr => {
        return usr.id === id && usr.provider === provider;
    });
    if (user === undefined) {
        console.warn("User", id, "is NOT authorized.");
        req.session.error = "User ID " + id + " is not Authorized!";
        res.redirect("/login");
    } else {
        console.info("User", id, "is authorized");
        return next();
    }
    /*
    else {
        let appAllowed = false;
        let appName = req.path.split("/")[2];
        if (appName !== undefined) {
            user.projects.forEach(prj => {
                if (appName.match(prj)) appAllowed = true;
            });
            if (appAllowed) {
                console.log("User", id, "is authorized to use app", appName);
                return next();
            } else {
                console.log("User", id, "is NOT authorized to use app", appName);
                req.session.error = "User " + id + " is not authorized to use app " + appName;
                res.redirect("/login");
            }
        } else {
            console.log("User", id, "is authorized");
            return next();
        }
    }
    */
}

// ========================================== EXPRESS ==========================================
// Configure Express
let app = express();
app.use(logger("dev"));
app.use(cookieParser());
app.use(bodyParser.json({limit: "5mb"}));
app.use(bodyParser.urlencoded({extended: true, limit: "5mb"}));
app.use(methodOverride());
app.use(session({resave: true, saveUninitialized: true, secret: "eugaefoiu"}));
app.use(passport.initialize());
app.use(passport.session());

// EP: serve favicon and static content
app.use(favicon(path.join(__dirname, "client", "favicon.ico")));
app.use(express.static(path.join(__dirname, "client")));

// Session-persisted message middleware
app.use(function(req, res, next) {
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
let hbs = exphbs.create({
    defaultLayout: "main",
    extname: ".hbs"
});
app.engine(".hbs", hbs.engine);
app.set("view engine", ".hbs");

// ========================================== DATABASE ==========================================
// Make our db accessible to our router
// Test 3
const monk = require("monk");
const db = monk(mongodbUrl);
app.use(function(req, res, next) {
    req.db = db;
    next();
});

// ============================== LOCAL AUTH. ROUTES ==========================================

/*
//displays our signup page
app.get("/signin", function(req, res) {
  res.render("signin");
});
*/

//sends the request through our local signup strategy, and if successful takes user to homepage, otherwise returns then to signin page
/*
app.post('/local-reg', passport.authenticate('local-signup', {
  successRedirect: '/',
  failureRedirect: '/signin'
  })
);
*/

//sends the request through our local login/signin strategy, and if successful takes user to homepage, otherwise returns then to signin page
/*
app.post('/login', passport.authenticate('local-signin', { 
  successRedirect: '/',
  failureRedirect: '/signin'
  })
);
*/

//logs user out of site, deleting them from the session, and returns to homepage
/*
app.get('/logout', function(req, res){
  let name = req.user.username;
  console.log("LOGGIN OUT " + req.user.username);
  req.logout();
  res.redirect("/");
  req.session.notice = "You have successfully been logged out " + name + "!";
});
*/

// ============================== GOOGLE AUTH ROUTES ==========================================
/*
// GET /auth/google
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Google authentication will involve
//   redirecting the user to google.com.  After authorization, Google
//   will redirect the user back to this application at /auth/google/callback
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });
*/
app.get(
    "/auth/google",
    passport.authenticate("google", {scope: ["https://www.googleapis.com/auth/plus.login"]})
);
//    [ 'https://www.googleapis.com/auth/plus.login',
//    , 'https://www.googleapis.com/auth/plus.profile.emails.read' ] }
//));

app.get(
    "/auth/google/callback",
    passport.authenticate("google", {failureRedirect: "/login"}),
    function(req, res) {
        // Successful authentication, redirect home.
        res.redirect("/");
    }
);

// ============================== GITHUB AUTH ROUTES ==========================================
app.get("/auth/github", passport.authenticate("github"));
//passport.authenticate('github', { scope: ['user:email']}));
//passport.authenticate('github', { scope: ['user']}));

app.get(
    "/auth/github/callback",
    passport.authenticate("github", {failureRedirect: "/login"}),
    function(req, res) {
        // Successful authentication, redirect home.
        res.redirect("/");
    }
);

// ========================================== WEB APP ROUTES ==========================================
app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
    //req.session.notice = "You have successfully been logged out " + name + "!";
});

//displays our login page
app.get("/login", function(req, res) {
    res.render("login");
});

app.get("/account", ensureAuthenticated, ensureAuthorized, function(req, res) {
    res.render("account", {user: req.user});
});

app.get("/", ensureAuthenticated, ensureAuthorized, function(req, res) {
    console.debug("Logged in. User data = ", JSON.stringify(req.user));

    // Fetch from project collection
    let coll = db.get("project");
    let sortName = {name: -1};
    let prjRegex = {$regex: config.PrjSubset};
    let prjSubset = {name: prjRegex};

    coll.find(prjSubset, {sort: sortName}, function(e, projects) {
        res.render("home", {
            user: req.user,
            TestRefBase: config.TestRefBase,
            projects: projects
        });
    });
});
//let projects = funct.getProjects("project");

app.get(
    "/project/:prjName",
    ensureAuthenticated,
    ensureAuthorized,
    // check for pattern YYYYMM[DD]-PrjName-EnvName
    check("prjName").matches(/^[0-9]{6,8}-[a-zA-Z0-9_]{2,20}-[a-zA-Z0-9_]{2,10}$/),
    function(req, res) {
        let prjName = req.params.prjName;

        // Check for input validation errors in the request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()});
        }

        // Fetch from project collection
        let prjColl = db.get("project");
        let prjRegex = {$regex: config.PrjSubset};
        let prjSubset = {name: prjRegex};
        console.info("Checking if entry exists for project " + prjName);
        prjColl.findOne({$and: [{name: prjName}, prjSubset]}, function(e, prj) {
            res.render("project", {
                user: req.user,
                CveRptBase: config.CveRptBase,
                CveRptSuffix: config.CveRptSuffix,
                prj: prj
            });
        });
    }
);

app.get(
    "/testing/:prjName",
    ensureAuthenticated,
    ensureAuthorized,
    // check for pattern YYYYMM[DD]-PrjName-EnvName
    check("prjName").matches(/^[0-9]{6,8}-[a-zA-Z0-9_]{2,20}-[a-zA-Z0-9_]{2,10}$/),
    function(req, res) {
        // Check for input validation errors in the request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()});
        }

        let prjName = req.params.prjName;
        let prjRegex = {$regex: config.PrjSubset};
        let prjSubset = {name: prjRegex};

        // Fetch from project collection
        let prjColl = db.get("project");
        console.debug("Checking if entry exists for project " + prjName);
        prjColl.findOne({$and: [{name: prjName}, prjSubset]}, function(e, prj) {
            if (prj === null) return;

            // Fetch from testkb collection
            console.info("Searching TestDB with scope", prj.scopeQry);
            let testKB = db.get("testkb");
            let issuesColl = db.get("issues");
            let cweColl = db.get("cwe");
            let PciTests = prj.PciTests;
            let Top10Tests = prj.Top10Tests;
            let Top25Tests = prj.Top25Tests;
            let StdTests = prj.StdTests;

            // Build scope query
            //let scopeQuery = (prj.scopeQry==="") ? {}:{ $or: [{TSource: prj.scopeQry},{TSource: "Extras"}]};
            let scopeQuery = {};
            // Whitelist scope value
            switch (prj.scopeQry) {
                case "Default":
                    scopeQuery = {
                        $or: [
                            {TSource: "OWASP-TG4"},
                            {TSource: "WAHH2"},
                            {TSource: "TBHM2015"},
                            {TSource: "Extras"}
                        ]
                    };
                    break;
                case "Extras":
                case "TBHM2015":
                case "OWASP-TG4":
                case "SEC542":
                case "SEC642":
                case "WAHH2":
                case "WebSvc":
                    scopeQuery = {$or: [{TSource: prj.scopeQry}, {TSource: "Extras"}]};
            }

            if (PciTests || Top10Tests || Top25Tests || StdTests) {
                let filter = {};
                if (PciTests)
                    filter =
                        JSON.stringify(filter).length <= 2
                            ? {TPCI: PciTests}
                            : {$or: [filter, {TPCI: PciTests}]};
                if (Top10Tests)
                    filter =
                        JSON.stringify(filter).length <= 2
                            ? {TTop10: Top10Tests}
                            : {$or: [filter, {TTop10: Top10Tests}]};
                if (Top25Tests)
                    filter =
                        JSON.stringify(filter).length <= 2
                            ? {TTop25: Top25Tests}
                            : {$or: [filter, {TTop25: Top25Tests}]};
                if (StdTests)
                    filter =
                        JSON.stringify(filter).length <= 2
                            ? {TStdTest: StdTests}
                            : {$or: [filter, {TStdTest: StdTests}]};
                scopeQuery = {$and: [scopeQuery, filter]};
            }

            // Search the issue collection
            testKB.find(scopeQuery, {sort: {TID: 1}}, function(e, tests) {
                issuesColl.find({PrjName: prjName}, {sort: {IPriority: -1}}, function(e, issues) {
                    cweColl.find({}, {sort: {ID: 1}}, function(e, cwes) {
                        res.render("testing", {
                            user: req.user,
                            prj: prj,
                            tests: tests,
                            issues: issues,
                            cwes: cwes,
                            CweUriBase: config.CweUriBase,
                            CveRptBase: config.CveRptBase,
                            CveRptSuffix: config.CveRptSuffix,
                            TestRefBase: config.TestRefBase,
                            ScopeQuery: JSON.stringify(scopeQuery)
                        });
                    });
                });
            });
        });
    }
);

// ========================================== REST ROUTES ==========================================
const prjRes = require("./server/ProjectRes");
const testkbRes = require("./server/TestKBRes");
const issueRes = require("./server/IssueRes");
const cweRes = require("./server/CweRes");
const reporting = require("./server/reporting");

app.get("/api/project", ensureAuthenticated, ensureAuthorized, prjRes.findAll);
app.get(
    "/api/project/:prjName",
    ensureAuthenticated,
    ensureAuthorized,
    // check for pattern YYYYMM[DD]-PrjName-EnvName
    check("prjName").matches(/^[0-9]{6,8}-[a-zA-Z0-9_]{2,20}-[a-zA-Z0-9_]{2,10}$/),
    prjRes.findByName
);
app.post(
    "/api/project",
    ensureAuthenticated,
    ensureAuthorized,
    checkSchema(validationSchema.project),
    prjRes.create
);
app.put(
    "/api/project/:name",
    ensureAuthenticated,
    ensureAuthorized,
    checkSchema(validationSchema.project),
    prjRes.update
);
app.delete(
    "/api/project/:name",
    ensureAuthenticated,
    ensureAuthorized,
    // check for pattern YYYYMM[DD]-PrjName-EnvName
    check("name").matches(/^[0-9]{6,8}-[a-zA-Z0-9_]{2,20}-[a-zA-Z0-9_]{2,10}$/),
    prjRes.removeByName
);
app.get("/api/testkb", ensureAuthenticated, ensureAuthorized, testkbRes.findAll);
app.get(
    "/api/testkb/:TID",
    ensureAuthenticated,
    ensureAuthorized,
    // check for allowable TID chars (letters, numbers, dash, dots)
    check("TID").matches(/^[0-9a-zA-Z\-\.]{5,20}$/),
    testkbRes.findByTID
);
app.post(
    "/api/testkb",
    ensureAuthenticated,
    ensureAuthorized,
    checkSchema(validationSchema.testKB),
    testkbRes.create // filtering out additional fields that aren't in the schema happens here
);

app.put(
    "/api/testkb/:tid",
    ensureAuthenticated,
    ensureAuthorized,
    checkSchema(validationSchema.testKB),
    testkbRes.update
);
app.get("/api/issue", ensureAuthenticated, ensureAuthorized, issueRes.findAll);
app.get(
    "/api/issue/:prjName",
    ensureAuthenticated,
    ensureAuthorized,
    // check for pattern YYYYMM[DD]-PrjName-EnvName
    check("prjName").matches(/^[0-9]{6,8}-[a-zA-Z0-9_]{2,20}-[a-zA-Z0-9_]{2,10}$/),
    issueRes.findProjectIssues
);
app.delete(
    "/api/issue/:prjName",
    ensureAuthenticated,
    ensureAuthorized,
    // check for pattern YYYYMM[DD]-PrjName-EnvName
    check("prjName").matches(/^[0-9]{6,8}-[a-zA-Z0-9_]{2,20}-[a-zA-Z0-9_]{2,10}$/),
    issueRes.removeAllForPrj
);
app.get(
    "/api/issue/:prjName/:tid",
    ensureAuthenticated,
    ensureAuthorized,
    // check for pattern YYYYMM[DD]-PrjName-EnvName
    check("prjName").matches(/^[0-9]{6,8}-[a-zA-Z0-9_]{2,20}-[a-zA-Z0-9_]{2,10}$/),
    // check for allowable TID chars (letters, numbers, dash, dots)
    check("tid").matches(/^[0-9a-zA-Z\-\.]{5,20}/),
    issueRes.findIssue
);
app.put(
    "/api/issue/:PrjName/:TID",
    ensureAuthenticated,
    ensureAuthorized,
    checkSchema(validationSchema.issue),
    issueRes.upsert
);
app.delete(
    "/api/issue/:prjName/:tid",
    ensureAuthenticated,
    ensureAuthorized,
    // check for pattern YYYYMM[DD]-PrjName-EnvName
    check("prjName").matches(/^[0-9]{6,8}-[a-zA-Z0-9_]{2,20}-[a-zA-Z0-9_]{2,10}$/),
    // check for allowable TID chars (letters, numbers, dash, dots)
    check("tid").matches(/^[0-9a-zA-Z\-\.]{5,20}/),
    issueRes.removeByName
);
app.get(
    "/api/issue/:PrjName/:TID",
    ensureAuthenticated,
    ensureAuthorized,
    // check for allowable TID chars (letters, numbers, dash, dots)
    check("TID").matches(/^[0-9a-zA-Z\-\.]{5,20}$/),
    issueRes.findIssue
);
app.get("/api/cwe", ensureAuthenticated, ensureAuthorized, cweRes.findAll);
app.get(
    "/api/cwe/:id",
    ensureAuthenticated,
    ensureAuthorized,
    // check CWE ID
    check("id").matches(/^[0-9]{1,4}$/),
    cweRes.findById
);

// ========================================== REPORTING ROUTES ==========================================
app.get("/issues.csv", ensureAuthenticated, ensureAuthorized, reporting.exportIssuesCSV);
app.get(
    "/report/csv/:prjName",
    ensureAuthenticated,
    ensureAuthorized,
    // check for pattern YYYYMM[DD]-PrjName-EnvName
    check("prjName").matches(/^[0-9]{6,8}-[a-zA-Z0-9_]{2,20}-[a-zA-Z0-9_]{2,10}$/),
    reporting.genPrjIssueReportCSV
);
app.get(
    "/export/json/:prjName",
    ensureAuthenticated,
    ensureAuthorized,
    // check for pattern YYYYMM[DD]-PrjName-EnvName
    check("prjName").matches(/^[0-9]{6,8}-[a-zA-Z0-9_]{2,20}-[a-zA-Z0-9_]{2,10}$/),
    reporting.genPrjIssueExportJSON
);
app.get(
    "/report/html/findings/:prjName",
    ensureAuthenticated,
    ensureAuthorized,
    // check for pattern YYYYMM[DD]-PrjName-EnvName
    check("prjName").matches(/^[0-9]{6,8}-[a-zA-Z0-9_]{2,20}-[a-zA-Z0-9_]{2,10}$/),
    reporting.genPrjIssueFindingsReportHtml
);
app.get(
    "/report/html/full/:prjName",
    ensureAuthenticated,
    ensureAuthorized,
    // check for pattern YYYYMM[DD]-PrjName-EnvName
    check("prjName").matches(/^[0-9]{6,8}-[a-zA-Z0-9_]{2,20}-[a-zA-Z0-9_]{2,10}$/),
    reporting.genPrjIssueFullReportHtml
);

// ========================================== START LISTENER ==========================================
app.listen(port);
/* eslint-disable */
console.info("Listening on port", port);
/* eslint-enable */
