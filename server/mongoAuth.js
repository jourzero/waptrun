var bcrypt = require('bcryptjs');
var Q = require('q');
var config = require('../config.js'); //config file contains all tokens and other private info

// MongoDB connection information
var mongodbUrl = process.env.MONGODB_URL || config.mongodbUrl;
var MongoClient = require('mongodb').MongoClient;

//used in local-signup strategy
exports.localReg = function (username, password) {
    var deferred = Q.defer();

    MongoClient.connect(mongodbUrl, function (err, db) {
        var collection = db.collection('localUsers');

        //check if username is already assigned in our database
        collection.findOne({'username' : username})
            .then(function (result) {
                if (null !== result) {
                    console.log("USERNAME ALREADY EXISTS:", result.username);
                    deferred.resolve(false); // username exists
                }
                else  {
                    var hash = bcrypt.hashSync(password, 8);
                    var user = {
                        "username": username,
                        "password": hash,
                        "avatar": "http://placepuppy.it/images/homepage/Beagle_puppy_6_weeks.JPG"
                    };

                    console.log("CREATING USER:", username);

                    collection.insert(user)
                        .then(function () {
                            db.close();
                            deferred.resolve(user);
                        });
                }
            });
    });

    return deferred.promise;
};


//check if user exists
//if user exists check if passwords match (use bcrypt.compareSync(password, hash); // true where 'hash' is password in DB)
//if password matches take into website
//if user doesn't exist or password doesn't match tell them it failed
exports.localAuth = function (username, password) {
    var deferred = Q.defer();

    MongoClient.connect(mongodbUrl, function (err, db) {
        var collection = db.collection('localUsers');

        collection.findOne({'username' : username})
            .then(function (result) {
                if (null === result) {
                    console.log("USERNAME NOT FOUND:", username);

                    deferred.resolve(false);
                }
                else {
                    var hash = result.password;

                    console.log("FOUND USER: " + result.username);

                    if (bcrypt.compareSync(password, hash)) {
                        deferred.resolve(result);
                    } else {
                        console.log("AUTHENTICATION FAILED");
                        deferred.resolve(false);
                    }
                }

                db.close();
            });
    });

    return deferred.promise;
};

/*
exports.getProjects = function (collectionName) {
  var deferred = Q.defer();

  MongoClient.connect(mongodbUrl, function (err, db) {
    var collection = db.collection(collectionName);
    if (err) throw err

    collection.find().toArray(function (err, results) {
        if (err) throw err

        if (null == results) {
          console.log("No data from", collectionName);
          deferred.resolve(false);
        }
        else {
          console.log("Found projects" + results.toString());
        }
        db.close();
      });
  });
  return deferred.promise;
}
*/