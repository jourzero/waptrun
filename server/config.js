const os = require("os");
const {createLogger, format, transports} = require("winston");
const {combine, timestamp, printf} = format;
const appRoot = require("app-root-path");
const appName = "express-tests";
const AUTH_MODE_NONE = 0;
const AUTH_MODE_OAUTH = 1;
const AUTH_MODE_LOCAL = 2;
const LOCAL_USER = {
    id: 0,
    provider: "none",
    username: "anonymous",
    displayName: "Anonymous User",
    local: true,
};
const myFormat = printf(({level, message, timestamp}) => {
    return `${timestamp} ${level}: ${message}`;
});

module.exports = {
    AUTH_MODE_NONE,
    AUTH_MODE_OAUTH,
    AUTH_MODE_LOCAL,
    LOCAL_USER,
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
    TestRefBase: "/static",

    // Query for use to show a subset of available projects
    PrjSubset: ".*",

    // Get appName from package.json
    appName: appName,

    // Set authentication Mode. Supported: AUTH_MODE_NONE, AUTH_MODE_OAUTH
    authMode: AUTH_MODE_NONE,
    //authMode: AUTH_MODE_OAUTH,
    //authMode: AUTH_MODE_LOCAL, // NOT SUPPORTED!

    // Session secret
    session: {
        resave: true,
        saveUninitialized: true,
        secret: "fawefjeaiaoeifj",
        //cookie: {path: "/", httpOnly: true, secure: true, sameSite: "lax"}
        cookie: {path: "/", httpOnly: true, secure: false, sameSite: "lax"},
    },

    // Configure request logging
    reqLogging: {
        file: {
            filename: `${appRoot}/logs/access.log`,
        },
    },

    // Configure app logging
    logging: {
        file: {
            format: combine(timestamp(), myFormat),
            level: "info",
            handleExceptions: true,
            json: true,
            colorize: false,
            maxsize: 5242880, // 5MB
            maxFiles: 2,
            filename: `${appRoot}/logs/app.log`,
        },
        console: {
            format: combine(format.colorize(), timestamp(), myFormat),
            level: "debug",
            handleExceptions: true,
            json: false,
            colorize: true,
        },
        syslog: {
            app_name: appName, // The name of the application (Default: process.title).
            format: format.json(),
            level: "info",
            host: "syslog.local", // The host running syslogd, defaults to localhost.
            port: "514", // The port on the host that syslog is running on, defaults to syslogd's default port.
            protocol: "udp4", // The network protocol to log over (e.g. tcp4, udp4, unix, unix-connect, etc).
            localhost: os.hostname(), // Host to indicate that log messages are coming from (Default: localhost).
            path: "/dev/log", // The path to the syslog dgram socket (i.e. /dev/log or /var/run/syslog for OS X).
            facility: "local0", // Syslog facility to use (Default: local0).
            type: "BSD", // The type of the syslog protocol to use (Default: BSD, also valid: 5424).
            pid: process.pid, // PID of the process that log messages are coming from (Default process.pid).
            //eol      : "\0"                // The end of line character to be added to the end of the message (Default: Message without modifications).
        },
    },
};
