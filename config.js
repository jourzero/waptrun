const os = require("os");
const winston = require("winston");
const appRoot = require("app-root-path");
const appName = "express-tests";

module.exports = {
    port: 5000,
    appname: "WAPT Runner",
    //'mongodbUrl': 'mongodb://USERNAME:PASSWORD!@HOSTNAME:PORT/DBNAME',
    mongodbUrl: "mongodb://waptrdb:27017/waptrunner",

    // Base URI and suffix part (to append after the query) for searching CVEs based on a partial software name
    //CveRptBase: "http://www.cvedetails.com/google-search-results.php?q=",
    //CveRptBase: "https://web.nvd.nist.gov/view/vuln/search-results?query=",
    CveRptBase:
        "https://nvd.nist.gov/products/cpe/search/results?status=FINAL&orderBy=CPEURI&namingFormat=2.3&keyword=",
    CveRptSuffix: "",

    // Base URI for getting CWE details
    CweUriBase: "https://cwe.mitre.org/data/definitions/",

    // Base URI for gettign CVE details
    CveUriBase: "http://www.cve.mitre.org/cgi-bin/cvename.cgi?name=",

    // Path to add to URI to show test reference details
    TestRefBase: "https://www.wapt.me/static",

    // Query for use to show a subset of available projects
    PrjSubset: ".*",

    // Get appName from package.json
    appName: appName,

    // Session secret
    session: {
        resave: true,
        saveUninitialized: true,
        secret: "fawefjeaiaoeifj",
        //cookie: {path: "/", httpOnly: true, secure: true, sameSite: "lax"}
        cookie: {path: "/", httpOnly: true, secure: false, sameSite: "lax"}
    },

    // Configure request logging
    reqLogging: {
        file: {
            filename: `${appRoot}/logs/access.log`
        }
    },

    // Configure app logging
    logging: {
        file: {
            format: winston.format.json(), // This format shouldn't cause CRLF issues
            level: "info",
            handleExceptions: true,
            json: true,
            colorize: false,
            maxsize: 5242880, // 5MB
            maxFiles: 2,
            filename: `${appRoot}/logs/app.log`
        },
        console: {
            format: winston.format.simple(),
            level: "debug",
            handleExceptions: true,
            json: false,
            colorize: true
        },
        syslog: {
            app_name: appName, // The name of the application (Default: process.title).
            format: winston.format.json(),
            level: "info",
            host: "syslog.local", // The host running syslogd, defaults to localhost.
            port: "514", // The port on the host that syslog is running on, defaults to syslogd's default port.
            protocol: "udp4", // The network protocol to log over (e.g. tcp4, udp4, unix, unix-connect, etc).
            localhost: os.hostname(), // Host to indicate that log messages are coming from (Default: localhost).
            path: "/dev/log", // The path to the syslog dgram socket (i.e. /dev/log or /var/run/syslog for OS X).
            facility: "local0", // Syslog facility to use (Default: local0).
            type: "BSD", // The type of the syslog protocol to use (Default: BSD, also valid: 5424).
            pid: process.pid // PID of the process that log messages are coming from (Default process.pid).
            //eol      : "\0"                // The end of line character to be added to the end of the message (Default: Message without modifications).
        }
    }
};
