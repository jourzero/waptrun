const validationSchema = require("./validationSchema.js");
const validationValues = require("./validationValues.js");
const logger = require("./lib/appLogger.js");

module.exports = {

    // OpenAPI spec header
    openapiDef: {
        definition: {
            openapi: "3.0.0",
            info: {
                title: "WAPT Runner",
                description: "Web App PenTesting Runner",
                version: "1.0.0",
            },
            servers: [
                { url: "http://localhost:5000", description: "Dev server" },
                { url: "https://waptrun.azurewebsites.net", description: "Staging server" },
            ],
            components: {
                schemas: {
                    account: {
                        type: "object",
                        properties: {
                            displayName: { type: "string", example: "Anonymous" },
                            family_name: { type: "string", example: "Smith" },
                            given_name: { type: "string", example: "John" },
                            id: { type: "string", example: "anon" },
                            language: { type: "string", example: "en" },
                            picture: { type: "string", example: "https://..." },
                            provider: { type: "string", example: "None" },
                            sub: { type: "string", example: "None" },
                        },
                    },
                    cwe: {
                        type: "object",
                        properties: {
                            CweID: { type: "integer", example: 6 },
                            Name: { type: "string", example: "J2EE Misconfiguration: Insufficient Session-ID Length" },
                            Weakness_Abstraction: { type: "string", example: "Variant" },
                            Status: { type: "string", example: "Incomplete" },
                            Description_Summary: { type: "string", example: "The J2EE application is configured to use an insufficient session ID length." },
                        },
                    },
                    issue: {
                        type: "object",
                        properties: {
                            PrjName: { type: "string", example: "20211201-MyApp-QA" },
                            TID: { type: "string", example: "API-T10-01" },
                            TIssueName: { type: "string", example: "Broken Object Level Authorization" },
                            CweId: { type: "integer", example: 284 },
                            IURIs: { type: "string", example: "https://app1.qaenv.local" },
                            IEvidence: { type: "string", example: "=== REQUEST ===\n\n=== RESPONSE ===\n" },
                            IScreenshots: { type: "string", example: "" },
                            IPriority: { type: "integer", example: 6 },
                            IPriorityText: { type: "string", example: "TODO" },
                            INotes: { type: "string", example: "The application..." },
                        },
                    },
                    project: {
                        type: "object",
                        properties: {
                            name: { type: "string", example: "20211201-MyApp-QA" },
                            notes: { type: "string", example: "Test everything." },
                            software: { type: "string", example: "cpe:2.3:a:nodejs:node.js:16.2.1:" },
                            TTestNameKeyword: { type: "string", example: "2019" },
                            TCweIDSearch: { type: "integer", example: 284 },
                            scope: { type: "string", example: "API" },
                            scopeQry: { type: "string", example: "API" },
                            PciTests: { type: "boolean", example: false },
                            Top10Tests: { type: "boolean", example: true },
                            Top25Tests: { type: "boolean", example: false },
                            StdTests: { type: "boolean", example: false },
                        },
                    },
                    testKB: {
                        type: "object",
                        properties: {
                            TID: { type: "string", example: "API-T10-01" },
                            TTestName: { type: "string", example: "API1:2019 - Broken Object Level Authorization (BOLA,IDOR)" },
                            TSource: { type: "string", example: "OWASP-API-T10" },
                            TTesterSupport: { type: "string", example: "APIs tend to expose endpoints ..." },
                            TTRef: { type: "string", example: "https://github.com/OWASP/API-Security/blob/master/2019/en/src/0xa1-broken-object-level-authorization.md" },
                            TCweID: { type: "integer", example: 284 },
                            TIssueName: { type: "string", example: "Broken Object Level Authorization" },
                            TIssueBackground: { type: "string", example: "Object level authorization is ..." },
                            TRemediationBackground: { type: "string", example: "How to Prevent?\n..." },
                            TSeverity: { type: "integer", example: 3 },
                            TPCI: { type: "boolean", example: false },
                            TTop10: { type: "boolean", example: true },
                            TTop25: { type: "boolean", example: false },
                            TStdTest: { type: "boolean", example: false },
                            TRef1: { type: "string", example: "https://cwe.mitre.org/data/definitions/285.html" },
                            TRef2: { type: "string", example: "https://cwe.mitre.org/data/definitions/639.html" },
                        },
                    },
                    cspReport: {
                        type: "object",
                        properties: {
                            "csp-report": { $ref: "#/components/schemas/cspReportDetails" },
                            timestamp: { type: "string", example: "2021-12-06T19:50:18.929Z" },
                        },
                    },
                    cspReportDetails: {
                        type: "object",
                        properties: {
                            "blocked-uri": { type: "string", example: "https://unexpected.domain.com/profile.jpg" },
                            "column-number": { type: "integer", example: 50 },
                            "document-uri": { type: "string", example: "https://myapp.com/mypage" },
                            "line-number": { type: "integer", example: 10 },
                            "original-policy": {
                                type: "string",
                                example:
                                    "default-src 'self' data:; img-src 'self' data: https://good1.domain.com https://good2.domain.com; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self'; frame-src 'none'; object-src 'none'; media-src 'self'; connect-src 'self'; sandbox allow-same-origin allow-forms allow-scripts; report-uri https://myapp.com/report-violation",
                            },
                            referrer: { type: "string", example: "https://myapp.com/home" },
                            "source-file": { type: "string", example: "https://myapp.com/js/myscript.js" },
                            "violated-directive": { type: "string", example: "img-src" },
                        },
                    },
                },
                securitySchemes: {
                    cookieAuth: {
                        type: "apiKey",
                        in: "cookie",
                        name: "connect.sid",
                    },
                    bearerAuth: {
                        type: "http",
                        description: "JWT Authorization header using the Bearer scheme.",
                        scheme: "bearer",
                        bearerFormat: "JWT",
                    },
                },
            },
            security: [
                { bearerAuth: [] },
                { cookieAuth: [] },
            ],
        },
        apis: ["./server/server.js"], // files containing annotations as above
    },
    openapiFilename: "../data/waptrun-openapi.json",
}