const logger = require("./lib/appLogger.js");
//const xml2js = require("xml2js");
//const parser = new xml2js.Parser();
const libxmljs = require("libxmljs");

exports.xmlparser = function (req, res) {
    let ok = function (doc) {
        logger.info("Successful hacktool execution");
        res.json(doc);
    };
    let err = function (errMsg) {
        logger.warn(`Failed hacktool execution: ${JSON.stringify(errMsg)}`);
        res.sendStatus(404);
    };
    logger.info("Running XML parser");
    parseXml(req.body, ok, err);
};

function parseXml(body, success, error) {
    logger.debug(`BODY: ${body}`);
    //this.testkb.findOne({_id: id}, response(success, error));
    //var products = libxmljs.parseXmlString(req.files.products.data.toString('utf8'), {noent:true,noblanks:true})
    let xmlDoc = libxmljs.parseXmlString(body, {noent: true, noblanks: true});
    let products = [];
    xmlDoc
        .root()
        .childNodes()
        .forEach((product) => {
            let newProduct = {};
            newProduct.name = product.childNodes()[0].text();
            newProduct.code = product.childNodes()[1].text();
            newProduct.tags = product.childNodes()[2].text();
            newProduct.description = product.childNodes()[3].text();
            products.push(newProduct);
        });
    success({products: products});
    /*
    parser.parseString(body, function (err, result) {
        if (err) {
            error({status: "XML parsing error"});
        }
        if (result) {
            var books = result["bookstore"]["book"];
            success({books: books});
        }
        error({status: "Unknown error in parseXml"});
    });
    */
}

// Callback to the supplied success and error functions
// The caller will supply this function. The callers implementation
// will provide the necessary logic. In the case of the sample app,
// the caller's implementation will send an appropriate http response.
let response = function (success, error) {
    return function (err, doc) {
        if (err) {
            // an error occurred, call the supplied error function
            error(err);
        } else {
            // call the supplied success function
            success(doc);
        }
    };
};
