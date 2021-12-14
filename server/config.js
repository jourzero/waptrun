const os = require("os");
const {createLogger, format, transports} = require("winston");
const {combine, timestamp, printf, json} = format;
const appRoot = require("app-root-path");
const appName = "express-tests";
const AUTH_MODE_NONE = 0;
const AUTH_MODE_OAUTH = 1;
const USE_HTTP2 = true;
const REPORT_TYPE_HTML = 1;
const REPORT_TYPE_CSV = 2;
const REPORT_TYPE_JSON = 3;
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
    LOCAL_USER,
    REPORT_TYPE_HTML,
    REPORT_TYPE_CSV,
    REPORT_TYPE_JSON,
    port: 5000,
    appname: "WAPT Runner",

    // Base URI and suffix part (to append after the query) for searching CVEs based on a partial software name
    //CveRptBase: "http://www.cvedetails.com/google-search-results.php?q=",
    //CveRptBase: "https://web.nvd.nist.gov/view/vuln/search-results?query=",
    CveRptBase: "https://nvd.nist.gov/products/cpe/search/results?status=FINAL&orderBy=CPEURI&namingFormat=2.3&keyword=",
    CveRptSuffix: "",

    // Base URI for getting CWE details
    CweUriBase: "https://cwe.mitre.org/data/definitions/",

    // Base URI for gettign CVE details
    CveUriBase: "http://www.cve.mitre.org/cgi-bin/cvename.cgi?name=",

    // Google OAuth public key
    googleRsaPublicKey:
        "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxWDJBwwxLU8KU0w2bqii\nXPPrOA7ffmF7g78O/D6LOv80bzeRyyX3zjzIcOI0tLZfFEfFO8CvpzTzB1h5bNin\nDA4MX9PFMyNBjc7Q4h7QStYZoORY6Kac314IQkwfVM3u4hbIpVvVgmapYESGpPfK\nh/SPr8tRvarDoEnXG6a501Ni8PfZg44aCbe0kJygl4YZjvLABEkH19HxPiXojxJE\nWee1lToyDJfM8tZqNTal5u3F8Mk37RhkMWMM1gypvl22t6MDUEOmqp5StwWWgo7K\nDJ17nDXsM6TQ10rxofkQm5I2swvfosr4Qr3GoUCrE1zXnPwNZJ/P+sQziOFRd36e\nZwIDAQAB\n-----END PUBLIC KEY-----\n",

    // Path to add to URI to show test reference details
    TestRefBase: "/static",

    // Query for use to show a subset of available projects
    PrjSubset: ".*",

    // Get appName from package.json
    appName: appName,

    // Set authentication Mode. Supported: AUTH_MODE_NONE, AUTH_MODE_OAUTH
    defaultAuthMode: AUTH_MODE_OAUTH,

    // Helmet config
    //   http://content-security-policy.com/
    //   http://www.html5rocks.com/en/tutorials/security/content-security-policy/
    //   http://www.html5rocks.com/en/tutorials/security/sandboxed-iframes/
    csp: {
        useDefaults: false,
        reportOnly: false,
        reportUri: "/report-violation",
        directives: {
            defaultSrc: ["'self'", "data:"],
            imgSrc: ["'self'", "data:", "https://lh3.googleusercontent.com", "https://avatars.githubusercontent.com"],
            scriptSrc: ["'self'", "'unsafe-eval'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            fontSrc: ["'self'"],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            connectSrc: ["'self'", "https://oauth2.googleapis.com"],
            sandbox: ["allow-same-origin", "allow-forms", "allow-scripts", "allow-popups", "allow-popups-to-escape-sandbox"],
        },
    },

    staticOptions: {
        // Allow /home instead of /home.html
        extensions: ["html"],
        // Disable directory indexing
        index: false,
        // Don't redirect to trailing “/” when the pathname is a directory.
        redirect: false,
        // Add an additional header to check if these options are used
        setHeaders: function (res, path, stat) {
            res.set("x-timestamp", Date.now());
        },
    },

    // Configure HTTP/2 support
    useHttp2: USE_HTTP2,

    // Session secret
    session: {
        resave: true,
        saveUninitialized: true,
        secret: "fawefjeaiaoeifj",
        cookie: {path: "/", httpOnly: true, secure: false, sameSite: "lax"},
    },

    // TLS config
    tlsPrivateKey: "../data/privkey3.pem",
    tlsCertificate: "../data/cert3.pem",

    // Configure request logging
    reqLogging: {
        file: {
            filename: `${appRoot}/logs/access.log`,
        },
    },

    // Configure app logging
    logging: {
        file: {
            format: combine(timestamp(), json()),
            level: "debug",
            handleExceptions: true,
            json: true,
            colorize: false,
            maxsize: 5242880, // 5MB
            maxFiles: 2,
            filename: `${appRoot}/logs/app.log`,
        },
        console: {
            format: combine(format.colorize(), timestamp(), myFormat),
            //level: "silly", // Show Sequelize queries and maybe other stuff
            level: "debug", // Usual logging level
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
