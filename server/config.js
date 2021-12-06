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
        directives: {
            defaultSrc: ["'self'", "data:"],
            imgSrc: ["'self'", "data:", "https://lh3.googleusercontent.com", "https://avatars.githubusercontent.com"],
            scriptSrc: ["'self'", "'unsafe-eval'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            fontSrc: ["'self'"],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            connectSrc: ["'self'"],
            sandbox: ["allow-same-origin", "allow-forms", "allow-scripts", "allow-popups", "allow-popups-to-escape-sandbox"],
        },
    },

    // OpenAPI spec header
    openapi: {
        definition: {
            openapi: "3.0.0",
            info: {
                title: "WAPT Runner",
                description: "Web App PenTesting Runner",
                version: "1.0.0",
            },
            //license: { name: "Licensed Under MIT", url: "https://spdx.org/licenses/MIT.html", },
            //contact: { name: "JourZero", url: "https://github.com/jourzero", },
            servers: [
                {url: "https://www.wapt.me:5000", description: "Development server"},
                {url: "https://www.wapt.qa", description: "QA server"},
            ],
            components: {
                schemas: {
                    account: {
                        type: "object",
                        properties: {
                            displayName: {type: "string"},
                            family_name: {type: "string"},
                            given_name: {type: "string"},
                            id: {type: "string"},
                            language: {type: "string"},
                            picture: {type: "string"},
                            provider: {type: "string"},
                            sub: {type: "string"},
                        },
                    },
                    cwe: {
                        type: "object",
                        properties: {
                            CweID: {type: "integer"},
                            Name: {type: "string"},
                            Weakness_Abstraction: {type: "string"},
                            Status: {type: "string"},
                            Description_Summary: {type: "string"},
                        },
                    },
                    issue: {
                        type: "object",
                        properties: {
                            PrjName: {type: "string"},
                            TID: {type: "string"},
                            TIssueName: {type: "string"},
                            CweId: {type: "integer"},
                            TIssueBackground: {type: "string"},
                            TRemediationBackground: {type: "string"},
                            TSeverity: {type: "integer"},
                            TRef1: {type: "string"},
                            TRef2: {type: "string"},
                            TSeverityText: {type: "string"},
                            IURIs: {type: "string"},
                            IEvidence: {type: "string"},
                            IScreenshots: {type: "string"},
                            IPriority: {type: "integer"},
                            IPriorityText: {type: "string"},
                            INotes: {type: "string"},
                        },
                    },
                    project: {
                        type: "object",
                        properties: {
                            name: {type: "string"},
                            notes: {type: "string"},
                            software: {type: "string"},
                            TTestNameKeyword: {type: "string"},
                            TCweIDSearch: {type: "integer"},
                            scope: {type: "string"},
                            scopeQry: {type: "string"},
                            PciTests: {type: "boolean"},
                            Top10Tests: {type: "boolean"},
                            Top25Tests: {type: "boolean"},
                            StdTests: {type: "boolean"},
                        },
                    },
                    testKB: {
                        type: "object",
                        properties: {
                            TID: {type: "string"},
                            TTestName: {type: "string"},
                            TSource: {type: "string"},
                            TTesterSupport: {type: "string"},
                            TTRef: {type: "string"},
                            TCweID: {type: "integer"},
                            TIssueName: {type: "string"},
                            TIssueBackground: {type: "string"},
                            TRemediationBackground: {type: "string"},
                            TSeverity: {type: "integer"},
                            TIssueType: {type: "string"},
                            TPCI: {type: "boolean"},
                            TTop10: {type: "boolean"},
                            TTop25: {type: "boolean"},
                            TStdTest: {type: "boolean"},
                            TRef1: {type: "string"},
                            TRef2: {type: "string"},
                        },
                    },
                },
                securitySchemes: {
                    bearerAuth: {
                        type: "http",
                        description: "JWT Authorization header using the Bearer scheme.",
                        scheme: "bearer",
                        bearerFormat: "JWT",
                    },
                    cookieAuth: {
                        type: "apiKey",
                        in: "cookie",
                        name: "connect.sid",
                    },
                },
            },
            security: [
                {
                    bearerAuth: [],
                },
                {cookieAuth: []},
            ],
        },
        apis: ["./server/server.js"], // files containing annotations as above
    },
    openapiFilename: "/app/data/waptrun-openapi.json",
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
        cookie: {path: "/", httpOnly: true, secure: USE_HTTP2, sameSite: "lax"},
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
