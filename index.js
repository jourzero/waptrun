var express = require('express');
var session = require('express-session');
var exphbs  = require('express-handlebars');
var passport = require('passport');
var LocalStrategy = require('passport-local');
//var http = require('http');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var methodOverride = require('method-override');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var multer = require('multer');
//var errorHandler = require('errorhandler');
//var TwitterStrategy = require('passport-twitter');
//var GoogleStrategy = require('passport-google');
//var FacebookStrategy = require('passport-facebook');
var config = require('./config.js'); 
var mongoAuth = require('./server/mongoAuth.js');


// ========================================== PASSPORT ==========================================
// Passport session setup.
passport.serializeUser(function(user, done) {
  console.log("serializing " + user.username);
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  console.log("deserializing " + obj);
  done(null, obj);
});

// Use the LocalStrategy within Passport to login users.
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

// Use the LocalStrategy within Passport to Register/"signup" users.
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

// Simple route middleware to ensure user is authenticated.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  req.session.error = 'Please sign in!';
  res.redirect('/signin');
}


// ========================================== EXPRESS ==========================================
// Configure Express
var app = express();
app.use(logger('dev'));
app.use(cookieParser());
app.use(bodyParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride());
app.use(session({ secret: 'supernova' }));
app.use(session({ resave: true,
                  saveUninitialized: true,
                  secret: 'eugaefoiu' }));
app.use(passport.initialize());
app.use(passport.session());

// EP: serve favicon and static content
var path = require('path');
var favicon = require('serve-favicon');
app.use(favicon(path.join(__dirname, 'client', 'favicon.ico')));
app.use(express.static(path.join(__dirname, 'client')));

// Session-persisted message middleware
app.use(function(req, res, next){
  var err = req.session.error,
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
var hbs = exphbs.create({
    defaultLayout: 'main',
    extname: '.hbs'
});
app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');



// ========================================== DATABASE ==========================================
// Make our db accessible to our router
// Test 3
var mongo = require('mongodb');
var monk = require('monk');
var mongodbUrl = config.mongodbUrl;
var db = monk(mongodbUrl);
app.use(function(req,res,next){
    req.db = db;
    next();
});



// ========================================== ROUTES ==========================================

//displays our signup page
app.get('/signin', function(req, res){
  res.render('signin');
});

//sends the request through our local signup strategy, and if successful takes user to homepage, otherwise returns then to signin page
app.post('/local-reg', passport.authenticate('local-signup', {
  successRedirect: '/',
  failureRedirect: '/signin'
  })
);

//sends the request through our local login/signin strategy, and if successful takes user to homepage, otherwise returns then to signin page
app.post('/login', passport.authenticate('local-signin', { 
  successRedirect: '/',
  failureRedirect: '/signin'
  })
);

//logs user out of site, deleting them from the session, and returns to homepage
app.get('/logout', function(req, res){
  var name = req.user.username;
  console.log("LOGGIN OUT " + req.user.username);
  req.logout();
  res.redirect('/');
  req.session.notice = "You have successfully been logged out " + name + "!";
});


// ========================================== WEB APP ROUTES ==========================================

app.get('/', ensureAuthenticated, function(req, res) {

    // Fetch from project collection
    var coll = db.get("project");
    var sortName = { name: -1 };
    var prjRegex = {$regex : config.PrjSubset}; 
    var prjSubset = {"name" : prjRegex};
    
    coll.find(prjSubset, {sort: sortName}, function(e, projects) {
        res.render('home', {
            user: req.user,
            projects : projects});
    });
});
//var projects = funct.getProjects("project");


app.get('/project/:prjName', ensureAuthenticated, function (req, res) {
    
    // TODO Check name
    var prjName = req.params.prjName;

    // Fetch from project collection
    var prjColl = db.get("project");
    var prjRegex = {$regex : config.PrjSubset}; 
    var prjSubset = {"name" : prjRegex};
    console.log("Checking if entry exists for project " + prjName);
    prjColl.findOne({$and: [ {name: prjName}, prjSubset]}, function(e, prj) {
        res.render('project', {
            user: req.user,
            CveRptBase: config.CveRptBase,
            CveRptSuffix: config.CveRptSuffix,            
            prj : prj});
    });      
});


app.get('/testing/:prjName', ensureAuthenticated, function (req, res) {
    
    // TODO Check name
    var prjName = req.params.prjName;
    var prjRegex = {$regex : config.PrjSubset}; 
    var prjSubset = {"name" : prjRegex};

    // Fetch from project collection
    var prjColl = db.get("project");
    console.log("Checking if entry exists for project " + prjName);
    prjColl.findOne({$and: [ {name: prjName}, prjSubset]}, function(e, prj) {

        // Fetch from testkb collection
        console.log("Searching TestDB with scope", prj.scopeQry);
        var testKB     = db.get("testkb");
        var issuesColl = db.get("issues");
        var cweColl    = db.get("cwe");
        let PciTests   = prj.PciTests;
        let Top10Tests = prj.Top10Tests;
        let Top25Tests = prj.Top25Tests;
        let StdTests   = prj.StdTests;
        
        // Build scope query
        let scopeQuery = (prj.scopeQry==="") ? {}:{ $or: [{TSource: prj.scopeQry},{TSource: "Extras"}]};
        if (PciTests || Top10Tests || Top25Tests || StdTests){
            let filter = {};
            filter = {TPCI: PciTests};
            filter = {"$or": [filter, {TTop10  : Top10Tests}]};
            filter = {"$or": [filter, {TTop25  : Top25Tests}]};
            filter = {"$or": [filter, {TStdTest: StdTests}]};
            //{"$and":[{"$and":[{"$and":[{"$and":[{"$or":[{"TSource":"OWASP-TG4"},{"TSource":"Extras"}]},{"TPCI":true}]},{"TTop10":true}]},{"TTop25":true}]},{"TStdTest":true}]}            
            //scopeQuery = PciTests   ? { $and: [scopeQuery, {TPCI: true} ]}     : scopeQuery;
            //scopeQuery = Top10Tests ? { $and: [scopeQuery, {TTop10: true} ]}   : scopeQuery;
            //scopeQuery = Top25Tests ? { $and: [scopeQuery, {TTop25: true} ]}   : scopeQuery;
            //scopeQuery = StdTests   ? { $and: [scopeQuery, {TStdTest: true} ]} : scopeQuery;        
            scopeQuery = {$and: [scopeQuery, filter]};        
        }

        // Search the issue collection
        testKB.find(scopeQuery, {sort:{TID:1}}, function(e, tests) {         
        issuesColl.find({PrjName: prjName}, {sort:{IPriority:-1}}, function(e, issues) {
        cweColl.find({}, {sort:{ID:1}}, function(e, cwes) {          
            res.render('testing', {
                user: req.user,
                prj : prj,
                tests: tests,
                issues: issues,
                cwes: cwes,
                CweUriBase: config.CweUriBase,
                CveRptBase: config.CveRptBase,
                CveRptSuffix: config.CveRptSuffix,            
                TestRefBase: config.TestRefBase,
                ScopeQuery : JSON.stringify(scopeQuery)
            });
        });});});
    });
});


// ========================================== REST ROUTES ==========================================
var prjRes    = require('./server/ProjectRes');
var testkbRes = require('./server/TestKBRes');
var issueRes  = require('./server/IssueRes');
var cweRes    = require('./server/CweRes');
var reporting = require('./server/reporting');
app.get( '/api/project',                ensureAuthenticated, prjRes.findAll);
app.get( '/api/project/:name',          ensureAuthenticated, prjRes.findByName);
app.post('/api/project',                ensureAuthenticated, prjRes.create);
app.put( '/api/project/:name',          ensureAuthenticated, prjRes.update);
app.delete('/api/project/:name',        ensureAuthenticated, prjRes.removeByName);
app.get( '/api/testkb',                 ensureAuthenticated, testkbRes.findAll);
app.get( '/api/testkb/:tid',            ensureAuthenticated, testkbRes.findByTID);
app.post('/api/testkb',                 ensureAuthenticated, testkbRes.create);
app.put( '/api/testkb/:tid',            ensureAuthenticated, testkbRes.update);
app.get( '/api/issue',                  ensureAuthenticated, issueRes.findAll);
app.get( '/api/issue/:prjName/:tid',    ensureAuthenticated, issueRes.findIssue);
app.get( '/api/issue/:prjName',         ensureAuthenticated, issueRes.findProjectIssues);
app.put( '/api/issue/:prjName/:tid',    ensureAuthenticated, issueRes.upsert);
app.delete('/api/issue/:prjName/:tid',  ensureAuthenticated, issueRes.removeByName);
app.delete('/api/issue/:prjName',       ensureAuthenticated, issueRes.removeAllForPrj);
app.get( '/api/cwe',                    ensureAuthenticated, cweRes.findAll);
app.get( '/api/cwe/:id',                ensureAuthenticated, cweRes.findById);
app.get( '/issues.csv',                 ensureAuthenticated, reporting.exportIssuesCSV);
app.get( '/report/csv/:prjName',        ensureAuthenticated, reporting.genPrjIssueReportCSV);
app.get( '/report/html/:prjName',       ensureAuthenticated, reporting.genPrjIssueReportHtml);


// ========================================== START LISTENER ==========================================
var port = process.env.PORT || config.port;
app.listen(port);
console.log("Listening on port", port);



