# Secure Coding Standard

<!-- TOC -->

- [Secure Coding Standard](#secure-coding-standard)
    - [Security-specific](#security-specific)
        - [Authentication](#authentication)
        - [Session Management](#session-management)
        - [Database security](#database-security)
        - [Input Validation & Sanitization](#input-validation--sanitization)
        - [Output encoding](#output-encoding)
        - [Software Updates](#software-updates)
        - [Secrets Management](#secrets-management)
        - [Data Encryption](#data-encryption)
        - [HTTP Headers](#http-headers)
    - [Security-related](#security-related)
        - [Dev. Environment](#dev-environment)
        - [Logging & Monitoring](#logging--monitoring)
        - [Documentation & Reporting](#documentation--reporting)
        - [Testing & QA](#testing--qa)

<!-- /TOC -->

Existing coding standard to be expanded during development / research.

## Security-specific

### Authentication

* OAuth IDP to avoid storing credentials (in some scenarios)
  * Use Passport with OAuth2 "passport", "passport-google-oauth2", "passport-github": ">= 0.0.0",

### Session Management

* Use "express-session" for session management. <mark>__TODO__</mark>: Add details

### Database security

* All DB create and insert operations should be against properly-defined DB tables/collections (e.g. with proper indexes to avoid record duplication)
* Validate all inputs and make sure that no special query characters make it to the query. Make sure that the database API is a well-known/acceptable/secure alternative.

### Input Validation & Sanitization

* Use [express-validator](https://www.npmjs.com/package/express-validator) with the following strategy
* For GET/DELETE requests (object reads or deletion), use check()
* For PUT/POST requests (object updates or creation), use schema validation via checkSchema() with a validation spec that contains validators and sanitizers from [validator.js](https://github.com/chriso/validator.js). Also use input attribute filtering via matchedData() to exclude attributes that aren't part of the schema (e.g. avoid prototype pollution by not allowing the addition of the ```__proto__``` attribute)

### Output encoding

* HTML-encode all DB data going to a web page (consider the DB as untrusted) using [Handlebars double-stash syntax](https://handlebarsjs.com/expressions.html): ```{{expression}}``` via [express-handlebars](https://www.npmjs.com/package/express-handlebars)
* HTML-encode all outputs for HTML report files using a custom HTML encoder. <mark>__TODO__</mark>: replace with [node-esapi](https://github.com/ESAPI/node-esapi)?

### Software Updates

* Dependency updates
  * Configure package.json to allow automatic update of dependencies:
    * At beginning of development, include the latest/stable/support version in package.json and keep each dependency updated to latest minor version by using "^". See bootstrap/jquery examples below.
    * During active development, monitor for new major releases via npm audit and plan for upgrades accordingly. Don't let updates/upgrades/migrations to new major releases wait for more than 6 months (meanwhile, let npm update minor release as quickly and frequently as possible).
    * Adjust code as recommended by release notes for major updates. Include regular planning/resourcing for this activity over time.
  * Auto-update client-side dependencies via npm modules and static loading:
    * add jquery and bootstart npm modules in package.json:
    ``` json
       "bootstrap": "^3.4.1",
       "jquery": "^3.4.1"
    ``` 
    * Load statically in main Node.js executable (server.js):
    ``` javascript
        app.use("/dist/jquery", express.static(__dirname + "/node_modules/jquery/dist/"));
        app.use("/dist/bootstrap", express.static(__dirname + "/node_modules/bootstrap/dist/"));
    ``` 
    * Use these script/style tags in main.hbs:
    ``` javascript
        <link rel="stylesheet" href="/dist/bootstrap/css/bootstrap.min.css">
        <script src="/dist/jquery/jquery.min.js"></script>
        <script src="/dist/bootstrap/js/bootstrap.min.js"></script>
    ``` 
  * In some cases, you may need to avoid code minimization/obfuscation/merging or other cloaking of 3rd party code to simplify its longer-term analysis or maintainability - e.g. static analysis for known vulnerabilities.
* Take special steps for your framework and its important modules/plugins. For example, make sure you use the latest/stable/support versions of NodeJS, ExpressJS, PassportJS releases.

### Secrets Management

* No secrets in the code repo
* Load local environment variable with "dotenv"
* Use .gitignore for files with special config
* <mark>__TODO__</mark>: Improve above baseline to be improved with better secrets management (using Vault or similar)
  * Save/use secrets to/from a key vault instead of flat files or environment variables

### Data Encryption

* TLS certificate management:
  * use Let's Encrypt for test/dev systems.
  * Use a commercial Root CA for client-facing Prod.
  * With Let's Encrypt, there's practiccaly no reason left to use self-signed certs (unless on a local dev system where we can even avoid TLS altogether)
* Data encryption at rest...

### HTTP Headers

* HTTP: CSP, security headers
  * Using nginx config:
    * CSP...
    * Cert
    * Perf. tweaks
  * Using ExpressJS features when needed
    * Helmet (if app is not fronted by a separate web server or reverse proxy)
    * Cookie protection
    * CSRF prevention


## Security-related

### Dev. Environment

* IDE: Use VS Code or similar settings as indicated below to avoid major discrepancies in code structuring and linting.
* Dev. Environment:
  * Use Docker, nodemon and volumes for code during dev.
  * Use Sonarlint
  * Use VSCode with Prettier, eslint with user config (instead of DevDependencies?):

  ``` json
        "sonarlint.disableTelemetry": true,
        "prettier.tabWidth": 4,
        "editor.formatOnSave": true,
        "eslint.enable": true,
        "vim.textwidth": 100,
        "editor.wordWrapColumn": 100,
        "prettier.printWidth": 100,
    ```

  * When using docker/docker-compose for simple multi-tier apps, use containers even for the reverse proxy tier to avoid compromising the host

### Logging & Monitoring

* App logging with [winston](https://www.npmjs.com/package/winston) and to console (simple format) and file (JSON format to avoid CRLF issues).
* Access and HTTP traffic logging via [morgan](https://www.npmjs.com/package/morgan).

### Documentation & Reporting
* Use [marked](https://www.npmjs.com/package/marked) to parse Markdown inputs into HTML outputs (reporting)

### Testing & QA
* <mark>__TODO__</mark>: add details on unit, integration and regression testing 
* <mark>__TODO__</mark>: add details on regression testing for main app features after libraries/dependencies/frameworks/plugins are updated/upgraded/migrated.
* <mark>__TODO__</mark>: web services testing, web services interface def. (swagger) and testing (swagger, postman...)
