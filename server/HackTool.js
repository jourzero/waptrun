const logger = require("./lib/appLogger.js");
//const xml2js = require("xml2js");
//const parser = new xml2js.Parser();
const libxmljs = require("libxmljs");
const serialize = require("node-serialize");
const mysql = require("mysql");
const sqlite3 = require("sqlite3");
const dbFile = "/app/data/chinook.db";

exports.xmlparser = function (req, res) {
    let ok = function (doc) {
        logger.info(`Successful hacktool execution. Doc: ${doc}`);
        res.json(doc);
    };
    let err = function (errMsg) {
        logger.warn(`Failed hacktool execution: ${JSON.stringify(errMsg)}`);
        //res.status(404);
        //res.send(errMsg);
        res.json({ERROR: errMsg});
    };
    logger.info("Running XML parser");
    parseXML(req.body, ok, err);
};

function parseXML(body, success, error) {
    logger.debug(`BODY: ${body}`);
    try {
        let xmlDoc = libxmljs.parseXmlString(body, {noent: true, noblanks: true});
        let elementType = xmlDoc.root().name();
        let elements = [];
        let elementsObj = {};
        xmlDoc
            .root()
            .childNodes()
            .forEach((element) => {
                let newElement = {};
                let elementName = element.name();
                for (let node of element.childNodes()) {
                    newElement[node.name()] = node.text();
                }
                elements.push(newElement);
            });
        //success({elements: elements});
        elementsObj[elementType] = elements;
        success(elementsObj);
    } catch (e) {
        error(`XML parsing error: ${e}`);
    }
}

exports.jsonparser = function (req, res) {
    let ok = function (doc) {
        logger.info("Successful hacktool execution");
        res.json(doc);
    };
    let err = function (errMsg) {
        logger.warn(`Failed hacktool execution: ${JSON.stringify(errMsg)}`);
        //res.status(404);
        //res.send(errMsg);
        res.json({ERROR: errMsg});
    };
    logger.info("Running JSON parser");
    parseJSON(req.body, ok, err);
};

function parseJSON(body, success, error) {
    logger.debug(`BODY: ${body}`);
    let jsonData = {};
    try {
        // Keep it insecure ;-) //jsonData = JSON.parse(body);
        jsonData = serialize.unserialize(body);
    } catch (e) {
        error(`JSON parsing error: ${e}`);
    }
    success(jsonData);
}

exports.mysql = function (req, res) {
    let ok = function (doc) {
        logger.info(`Successful hacktool execution. Doc: ${doc}`);
        res.json(doc);
    };
    let err = function (errMsg) {
        logger.warn(`Failed hacktool execution: ${JSON.stringify(errMsg)}`);
        res.json({ERROR: errMsg});
    };
    logger.info("Running mysql interpreter");
    mysqlQuery(req.body, ok, err);
};

function mysqlQuery(body, success, error) {
    let connection = mysql.createConnection({
        host: "localhost",
        user: "tester",
        database: "mysql",
        password: "Passw0rd123",
    });

    try {
        connection.connect();
        connection.query(body, function (err, results, fields) {
            if (err) {
                error(`MySql query error: ${err}`);
            } else {
                success(results);
            }
        });
        logger.debug("Ending connection");
        connection.end();
    } catch (e) {
        error(`MySql client exception: ${e}`);
    }
}

exports.sqlite = function (req, res) {
    let ok = function (doc) {
        logger.info(`Successful hacktool execution. Doc: ${JSON.stringify(doc)}`);
        res.json(doc);
    };
    let err = function (errMsg) {
        logger.warn(`Failed hacktool execution: ${JSON.stringify(errMsg)}`);
        res.json({ERROR: errMsg});
    };
    logger.info("Running mysql interpreter");
    sqliteQuery(req.body, ok, err);
};

function sqliteQuery(body, success, error) {
    try {
        let db = new sqlite3.Database(dbFile);
        logger.info(`Query to sqlite3 DB: ${body}`);
        db.serialize(() => {
            let results = [];
            db.each(
                body,
                (err, row) => {
                    if (err) {
                        logger.error(`Error with sqlite3 query: ${err}`);
                        return;
                    }
                    results.push(row);
                },
                () => {
                    success(results);
                }
            );
        });
        logger.debug("Closing the DB");
        db.close();
    } catch (e) {
        logger.error(`Exception with sqlite3 client: ${e}`);
        error(`Exception with sqlite3 client: ${e}`);
        return;
    }
}
