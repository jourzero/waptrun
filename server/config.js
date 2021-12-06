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
                            displayName: {type: "string", example: "Anonymous"},
                            family_name: {type: "string", example: "Smith"},
                            given_name: {type: "string", example: "John"},
                            id: {type: "string", example: "anon"},
                            language: {type: "string", example: "en"},
                            picture: {type: "string", example: "https://..."},
                            provider: {type: "string", example: "None"},
                            sub: {type: "string", example: "None"},
                        },
                    },
                    cwe: {
                        type: "object",
                        properties: {
                            CweID: {type: "integer", example: 6},
                            Name: {type: "string", example: "J2EE Misconfiguration: Insufficient Session-ID Length"},
                            Weakness_Abstraction: {type: "string", example: "Variant"},
                            Status: {type: "string", example: "Incomplete"},
                            Description_Summary: {type: "string", example: "The J2EE application is configured to use an insufficient session ID length."},
                        },
                    },
                    issue: {
                        type: "object",
                        properties: {
                            PrjName: {type: "string", example: "20211201-MyApp-QA"},
                            TID: {type: "string", example: "API-T10-01"},
                            TIssueName: {type: "string", example: "Broken Object Level Authorization"},
                            CweId: {type: "integer", example: 284},
                            IURIs: {type: "string", example: "https://app1.qaenv.local"},
                            IEvidence: {type: "string", example: "=== REQUEST ===\n\n=== RESPONSE ===\n"},
                            IScreenshots: {type: "string", example: ""},
                            IPriority: {type: "integer", example: 6},
                            IPriorityText: {type: "string", example: "TODO"},
                            INotes: {type: "string", example: "The application..."},
                        },
                    },
                    project: {
                        type: "object",
                        properties: {
                            name: {type: "string", example: "20211201-MyApp-QA"},
                            notes: {type: "string", example: "Test everything."},
                            software: {type: "string", example: "cpe:2.3:a:nodejs:node.js:16.2.1:"},
                            TTestNameKeyword: {type: "string", example: "2019"},
                            TCweIDSearch: {type: "integer", example: 284},
                            scope: {type: "string", example: "API"},
                            scopeQry: {type: "string", example: "API"},
                            PciTests: {type: "boolean", example: false},
                            Top10Tests: {type: "boolean", example: true},
                            Top25Tests: {type: "boolean", example: false},
                            StdTests: {type: "boolean", example: false},
                        },
                    },
                    testKB: {
                        type: "object",
                        properties: {
                            TID: {type: "string", example: "API-T10-01"},
                            TTestName: {type: "string", example: "API1:2019 - Broken Object Level Authorization (BOLA,IDOR)"},
                            TSource: {type: "string", example: "OWASP-API-T10"},
                            TTesterSupport: {type: "string", example: "APIs tend to expose endpoints ..."},
                            TTRef: {type: "string", example: "https://github.com/OWASP/API-Security/blob/master/2019/en/src/0xa1-broken-object-level-authorization.md"},
                            TCweID: {type: "integer", example: 284},
                            TIssueName: {type: "string", example: "Broken Object Level Authorization"},
                            TIssueBackground: {type: "string", example: "Object level authorization is ..."},
                            TRemediationBackground: {type: "string", example: "How to Prevent?\n..."},
                            TSeverity: {type: "integer", example: 3},
                            TPCI: {type: "boolean", example: false},
                            TTop10: {type: "boolean", example: true},
                            TTop25: {type: "boolean", example: false},
                            TStdTest: {type: "boolean", example: false},
                            TRef1: {type: "string", example: "https://cwe.mitre.org/data/definitions/285.html"},
                            TRef2: {type: "string", example: "https://cwe.mitre.org/data/definitions/639.html"},
                        },
                    },
                    cspReport: {
                        type: "object",
                        properties: {
                            "csp-report": {$ref: "#/components/schemas/cspReportDetails"},
                            timestamp: {type: "string", example: "2021-12-06T19:50:18.929Z"},
                        },
                    },
                    cspReportDetails: {
                        type: "object",
                        properties: {
                            "blocked-uri": {type: "string", example: "https://unexpected.domain.com/profile.jpg"},
                            "column-number": {type: "integer", example: 50},
                            "document-uri": {type: "string", example: "https://myapp.com/mypage"},
                            "line-number": {type: "integer", example: 10},
                            "original-policy": {
                                type: "string",
                                example:
                                    "default-src 'self' data:; img-src 'self' data: https://good1.domain.com https://good2.domain.com; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self'; frame-src 'none'; object-src 'none'; media-src 'self'; connect-src 'self'; sandbox allow-same-origin allow-forms allow-scripts; report-uri https://myapp.com/report-violation",
                            },
                            referrer: {type: "string", example: "https://myapp.com/home"},
                            "source-file": {type: "string", example: "https://myapp.com/js/myscript.js"},
                            "violated-directive": {type: "string", example: "img-src"},
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
