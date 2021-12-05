# Web App Pen Test Runner

<!-- TOC -->

-   [Web App Pen Test Runner](#web-app-pen-test-runner)
    -   [Usage Help](#usage-help)
    -   [Running this code within Docker](#running-this-code-within-docker)
        -   [Get the code](#get-the-code)
        -   [Start App and DB servers in separate containers](#start-app-and-db-servers-in-separate-containers)
        -   [At first run, initialize the database](#at-first-run-initialize-the-database)
        -   [When needed backup your database](#when-needed-backup-your-database)
        -   [When needed add TestKB data (e.g. using Excel)](#when-needed-add-testkb-data-eg-using-excel)
        -   [When needed, download new CWE data from Mitre and import it](#when-needed-download-new-cwe-data-from-mitre-and-import-it)
    -   [Design Criteria](#design-criteria)
    -   [Current Features](#current-features)
    -   [Snyk Results](#snyk-results)

<!-- /TOC -->

## Usage Help

Refer to [Help](server/doc/Help.md) for end-user documentation and to [methodologies supported](server/doc/Methodologies.md) for additional details.

## Running this code within Docker

### Get the code

```bash
$ git clone git@github.com:jourzero/waptrun.git
$ cd waptrun
```

### Start App and DB servers in separate containers

```bash
# Build and run from Docker host
$ docker-compose up -d
```

### At first run, initialize the database

```bash
host$ docker exec -it waptrun /bin/bash

ode@98a77e57e94e:/app$ cp dbinit/waptrun.sqlited data/
```

### When needed backup your database

-   Click **Backup DB** button from the home page.

### When needed add TestKB data (e.g. using Excel)

```bash
# TODO: add instructions here
```

### When needed, download new CWE data from Mitre and import it

```bash
# TODO update below
[utils]$ ./import-cwe.sh
```

## Design Criteria

-   Keep the app's window small and useful. Use field auto-expansion to avoid scrolling and to provide a compact snapshot of results.
-   Avoid too many clicks by keeping all inputs in a single window and use UI automations and artifacts (mouse hovering, links).
-   Separate field for Severity and Priority. The latter is representative of risk and other factors that should adjust how quickly we should implement a fix.
-   Keep history of remediated issues (use Priority = Remediated)

Resulting page with TestKB, Generic Issue Data, Specific Issue Data and Issue List:

![Compact Test Runner](server/doc/screenshots/c1.png)

## Current Features

-   Multi-project
-   Multiple [methodologies supported](server/doc/Methodologies.md)
-   Test stepping
-   Dynamic Test KB updates
-   Dynamic, color-coded issue list, per project
-   Auto-type test names and CWEs
-   Ability to add new tests based on new CVEs or other
-   CVE search on cvedetails.com
-   Export to CSV and HTML from UI
-   Import Burp issues from my Clipboarder Burp App. To use it:
    -   Download [Clipboarder extension](https://github.com/jourzero/clipboarder/blob/master/dist/Clipboarder.jar)
    -   Add Clipboarder extension to Burp
    -   Select one issue from Target/Issues
    -   Use context menu "Copy as free text to clipboard"
    -   Paste clipboard content into WAPT Runner's Notes field
    -   Result: Burp issue text will be parsed and UI fields like Issue Name, Evidence, Severity, Priority will be adjusted accordingly.
-   Import screen shots from clipboard and paste them into the Paste Area as HTML5 Base64 images.
    -   Screen shots are shown when viewing an issue from the issue list.
    -   Screen shots are included in reports.
-   User Authentication with Passport and OAuth2 (Google and Github)
-   Serve static content with Express.js
-   App was dockerized.

## Snyk Results

[![Known Vulnerabilities](https://snyk.io/test/github/jourzero/waptrun/badge.svg)](https://snyk.io/test/github/jourzero/waptrun)
