const winston = require("winston");
const config = require("../config.js");

// Requiring `winston-syslog` exposes `winston.transports.Syslog`
//require("winston-syslog").Syslog;

// define the custom settings for each transport (file, console)

const logger = winston.createLogger({
    transports: [
        //new winston.transports.Syslog(config.logging.syslog),
        new winston.transports.Console(config.logging.console),
        new winston.transports.File(config.logging.file)
    ]
});

module.exports = logger;
