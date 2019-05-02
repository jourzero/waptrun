// Setup request logging
const morgan = require("morgan");
const fs = require("fs");
const config = require("../config.js");

// create a write stream (in append mode)
const accessLogStream = fs.createWriteStream(config.reqLogging.file.filename, {flags: "a"});

// Save combined log. Ref.: https://github.com/expressjs/morgan
module.exports = morgan("combined", {stream: accessLogStream});
