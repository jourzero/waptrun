var testkb = require('./TestKBModel')();
 
exports.findAll = function(req, res) {
    var ok = function(doc) {
        res.json(doc);
    };
    var err = function(err) {
        res.send(404);
    };
    testkb.findAll(ok, err);
};
 
exports.findById = function(req, res) {
    var ok = function(doc) {
        res.json(doc);
    };
    var err = function(err) {
        //res.send(404);
        res.status(404).send('Sorry, we cannot find that!');
    };
    testkb.findById(req.params.id, ok, err);
};

exports.findByName = function(req, res) {
    var ok = function(doc) {
        res.json(doc);
    };
    var err = function(err) {
        //res.send(404);
        res.status(404).send('Sorry, we cannot find that!');
    };
    testkb.findByName(req.params.name, ok, err);
};

exports.findByTID = function(req, res) {
    var ok = function(doc) {
        res.json(doc);
    };
    var err = function(err) {
        //res.send(404);
        res.status(404).send('Sorry, we cannot find that!');
    };
    testkb.findByTID(req.params.tid, ok, err);
};


exports.create = function(req, res) {
    var ok = function(doc) {
        res.location('/api/testkb/doc.TID');
        res.send(201);
    };
    var err = function(err) {
        res.send(409, "Failed to create object");
    };
    testkb.create(req.body, ok, err);
};
 
exports.update = function(req, res) {
    //if (!req.body._id) {
    //        res.send(404, "id required");
    //} else {
        var ok = function(doc) {
            res.send(200);
        };
        var err = function(err) {
            res.send(409, "update failed");
        };
        testkb.update(req.params.tid, req.body, ok, err);
    //}
};
 
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
        testkb.removeById(req.params.id, ok, err);
    }
};
        
                