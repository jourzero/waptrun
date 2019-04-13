var issue = require('./IssueModel')();
 
// Find all issues in all projects (routes: /api/issue, /issues.csv)
exports.findAll = function(req, res) {
    var ok = function(doc) {
        res.json(doc);
    };
    var err = function(err) {
        res.send(404);
    };
    issue.findAll(ok, err);
};
 
/* 
// Find an issue by is ID (unused) 
exports.findById = function(req, res) {
    var ok = function(doc) {
        res.json(doc);
    };
    var err = function(err) {
        //res.send(404);
        res.status(404).send('Sorry, we cannot find that!');
    };
    issue.findById(req.params.id, ok, err);
};
*/

/*
// Find an issue by it' name (unused)
exports.findByName = function(req, res) {
    var ok = function(doc) {
        res.json(doc);
    };
    var err = function(err) {
        //res.send(404);
        res.status(404).send('Sorry, we cannot find that!');
    };
    issue.findByName(req.params.name, ok, err);
};
*/

// Find an issue by project name and test ID (route: /api/issue/:prjName/:tid)
exports.findIssue = function(req, res) {
    var ok = function(doc) {
        res.json(doc);
    };
    var err = function(err) {
        //res.send(404);
        res.sendStatus(404);
    };
    issue.findIssue(req.params.prjName, req.params.tid, ok, err);
};

// Find all issues for a project (routes: /api/issue/:prjName, /report/csv/:prjName, /report/html/:prjName)
exports.findProjectIssues = function(req, res) {
    var ok = function(doc) {
        res.json(doc);
    };
    var err = function(err) {
        res.sendStatus(404);
    };
    issue.findIssue(req.params.prjName, ok, err);
};

/*
// Create a new issue. Unused.
exports.create = function(req, res) {
    var ok = function(doc) {
        res.location('/issue/doc._id');
        res.send(201);
    };
    var err = function(err) {
        res.send(409, "Failed to create object");
    };
    issue.create(req.body, ok, err);
};
*/
 
// Upsert an issue (route: /api/issue/:prjName/:tid) 
exports.upsert = function(req, res) {
    //if (!req.body._id) {
    //        res.send(404, "id required");
    //} else {
    var ok = function(doc) {
        res.sendStatus(200);
    };
    var err = function(err) {
        res.send(409, "update failed");
    };
    issue.upsert(req.params.prjName, req.params.tid, req.body, ok, err);
    //}
};
 

/*
// Remove an issue by ID (unused)
exports.removeById = function(req, res) {
    if (!req.body._id) {
        res.send(404, "id required");
    } else {
        var ok = function(doc) {
            res.send(200);
        };
        var err = function(err) {
            res.send(409, "Failed to remove object");
        };
        issue.removeById(req.params.id, ok, err);
    }
};
*/


// Remove an issue by name (route: /api/issue/:prjName/:tid)
exports.removeByName = function(req, res) {
    //if (!req.body._id) {
    //    res.send(404, "id required");
    //} else {
    var ok = function(doc) {
        res.sendStatus(200);
    };
    var err = function(err) {
        res.send(409, "Failed to remove object");
    };
    issue.removeByName(req.params.prjName, req.params.tid, ok, err);
    //}
};
        

// Remove all issues for a project (route: /api/issue/:prjName)
exports.removeAllForPrj = function(req, res) {
    //if (!req.body._id) {
    //    res.send(404, "id required");
    //} else {
    var ok = function(doc) {
        res.sendStatus(200);
    };
    var err = function(err) {
        res.send(409, "Failed to remove object");
    };
    issue.removeAllForPrj(req.params.prjName, ok, err);
    //}
};
        
