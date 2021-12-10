const {createLogger, format, transports} = require("winston");
const config = require("../config.js");
const {combine, timestamp, printf} = format;
const logger = createLogger({
    //format: combine(format.colorize(), timestamp(), myFormat),
    transports: [new transports.Console(config.logging.console), new transports.File(config.logging.file)],
});

module.exports = logger;
