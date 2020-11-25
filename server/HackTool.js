const logger = require("./lib/appLogger.js");
const libxmljs = require("libxmljs");
const serialize = require("node-serialize");
const mysql = require("mysql");
const sqlite3 = require("sqlite3");

exports.xmlparser = function (req, res) {
    let ok = function (doc) {
        logger.info(`Successful hacktool execution. Doc: ${JSON.stringify(doc)}`);
        res.json(doc);
    };
    let err = function (errMsg) {
        logger.warn(`Failed hacktool execution: ${JSON.stringify(errMsg)}`);
        res.json({ERROR: errMsg});
    };
    logger.info("Running XML parser");
    parseXML(req.body, req.query, ok, err);
};

function parseXML(body, query, success, error) {
    logger.debug(`BODY: ${body}`);
    if (query.noent === "false") query.noent = false;
    if (query.noent === "true") query.noent = true;
    if (query.noblanks === "false") query.noblanks = false;
    if (query.noblanks === "true") query.noblanks = true;
    logger.debug(`Query: ${JSON.stringify(query)}`);
    try {
        let xmlDoc = libxmljs.parseXmlString(body, query);
        let elementType = xmlDoc.root().name();
        let elements = [];
        let elementsObj = {};
        xmlDoc
            .root()
            .childNodes()
            .forEach((element) => {
                let newElement = {};
                //let elementName = element.name();
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
        logger.info(`Successful hacktool execution. Doc: ${JSON.stringify(doc)}`);
        res.json(doc);
    };
    let err = function (errMsg) {
        logger.warn(`Failed hacktool execution: ${JSON.stringify(errMsg)}`);
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
        logger.info(`Successful hacktool execution. Doc: ${JSON.stringify(doc)}`);
        res.json(doc);
    };
    let err = function (errMsg) {
        logger.warn(`Failed hacktool execution: ${JSON.stringify(errMsg)}`);
        res.json({ERROR: errMsg});
    };
    logger.info("Running mysql interpreter");
    mysqlQuery(req.body, req.query, ok, err);
};

function mysqlQuery(body, query, success, error) {
    logger.debug(`Query: ${JSON.stringify(query)}`);
    //let connection = mysql.createConnection({ host: "localhost", user: "tester", database: "mysql", password: "Passw0rd123", });
    let connection = mysql.createConnection(query);

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
    sqliteQuery(req.body, req.query, ok, err);
};

function sqliteQuery(body, param, success, error) {
    try {
        let dbFile = param.dbFile;
        let db = new sqlite3.Database(dbFile);
        logger.info(`Query to sqlite3 DB ${dbFile}: ${body}`);
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
