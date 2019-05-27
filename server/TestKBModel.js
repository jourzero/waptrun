// export this module, so that it is accessible to our application modules
module.exports = TestKB;
const config = require("../config.js");
const mongodbUrl = process.env.MONGODB_URL || config.mongodbUrl;
const db = require("monk")(mongodbUrl);

// TestKB constructor
function TestKB() {
    if (!(this instanceof TestKB)) {
        return new TestKB();
    }

    // obtain a reference to our collection within mongodb
    this.testkb = db.get("testkb");
}

// Retrieve a list of all persisted
TestKB.prototype.findAll = function(success, error) {
    this.testkb.find({}, {}, response(success, error));
};

// Retrieve a document by its id
TestKB.prototype.findById = function(id, success, error) {
    /*
    TODO: CWE-117 Improper Output Neutralization for Logs
    TestKBModel.js: 24
    Severity: Medium
    Attack Vector: console.log
    Number of Modules Affected: 1
    Description: This call to console.log() could result in a log forging attack. Writing untrusted data into a log file allows an attacker to forge log entries or inject malicious content into log files. Corrupted log files can be used to cover an attacker's tracks or as a delivery mechanism for an attack on a log viewing or processing utility. For example, if a web administrator uses a browser-based utility to review logs, a cross-site scripting attack might be possible.
    Remediation: Avoid directly embedding user input in log files when possible. Sanitize untrusted data used to construct log entries by using a safe logging mechanism such as the OWASP ESAPI Logger, which will automatically remove unexpected carriage returns and line feeds and can be configured to use HTML entity encoding for non-alphanumeric data. Alternatively, some of the XSS escaping functions from the OWASP Java Encoder project will also sanitize CRLF sequences. Only write custom blacklisting code when absolutely necessary. Always validate untrusted input to ensure that it conforms to the expected format, using centralized data validation routines when possible.
    */
    console.log("Trying to find by id", id);
    this.testkb.findOne({_id: id}, response(success, error));
};

// Retrieve a document by its Name
// TODO: fix the find query to make it work with the name
TestKB.prototype.findByTID = function(tid, success, error) {
    this.testkb.findOne({TID: tid}, response(success, error));
};

// Persist a new document to mongodb
TestKB.prototype.create = function(doc, success, error) {
    this.testkb.insert(doc, response(success, error));
};

// Update an existing document by id in mongodb
TestKB.prototype.update = function(tid, data, success, error) {
    this.testkb.update({TID: tid}, {$set: data}, response(success, error));
};

// Remove a document by id from the mongodb
TestKB.prototype.removeById = function(id, success, error) {
    this.testkb.remove({_id: id}, response(success, error));
};

// Callback to the supplied success and error functions
// The caller will supply this function. The callers implementation
// will provide the necessary logic. In the case of the sample app,
// the caller's implementation will send an appropriate http response.
let response = function(success, error) {
    return function(err, doc) {
        if (err) {
            // an error occurred, call the supplied error function
            error(err);
        } else {
            // call the supplied success function
            success(doc);
        }
    };
};
