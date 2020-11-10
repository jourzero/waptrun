# Web App Pen Test Runner

<!-- TOC -->

-   [Web App Pen Test Runner](#web-app-pen-test-runner)
    -   [Overview](#overview)
    -   [Running this code within Docker](#running-this-code-within-docker)
        -   [Get the code](#get-the-code)
        -   [Start App and DB servers in separate containers](#start-app-and-db-servers-in-separate-containers)
        -   [At first run, download Mongo client and initialize the database](#at-first-run-download-mongo-client-and-initialize-the-database)
        -   [When needed backup your database](#when-needed-backup-your-database)
        -   [When needed add TestKB data (e.g. using Excel)](#when-needed-add-testkb-data-eg-using-excel)
        -   [When needed, download new CWE data from Mitre and import it](#when-needed-download-new-cwe-data-from-mitre-and-import-it)
        -   [When needed, use the mongo shell](#when-needed-use-the-mongo-shell)
        -   [Browse to the app](#browse-to-the-app)
        -   [Stop App and DB containers](#stop-app-and-db-containers)
    -   [Basic Idea](#basic-idea)
    -   [Design focus](#design-focus)
        -   [Phase 1](#phase-1)
        -   [Phase 2](#phase-2)
        -   [Phase 3](#phase-3)
        -   [Phase 4](#phase-4)
        -   [Phase 5](#phase-5)
        -   [Phase 6](#phase-6)
    -   [Additional Criteria](#additional-criteria)
    -   [Current Features](#current-features)
    -   [IMPORTANT NOTE](#important-note)
    -   [Snyk Results](#snyk-results)

<!-- /TOC -->

## Overview

This is a tool that has helped me run through web app pen tests by stepping through various tests and log issues easily without taking too much screen space -- i.e. allowing tiling of the AUT on the left side of the screen (~75% width) and this test runner app on the right (~25% width).

It is built on NodeJS, ExpressJS and PassportJS and it uses a MongoDB to persist the results and to evolve a Security Testing Knowledge Base over time, from our own testing. It can easily run in a lightweight Docker container and it allows for multiple testers to contribute on the same or different projects from the same Node server or the same MongoDB (issues are logged as quickly and atomically as possible). It's not impossible to experience some data update issues while working collaboratively but it is assumed that concurrent testers communicate via Slack/Teams/Skype while dividing and conquering.

## Running this code within Docker

**WARNING**: This won't work until I include a sanitized MongoDB snapshot or an import mechanism. See [Issues](https://github.com/jourzero/waptrun/issues).

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

### At first run, download Mongo client and initialize the database

```bash
$ cd utils/

# Download and unpack Mongo client (from host)
[utils]$ ./download-mongo-client.sh

[utils]$ tar xvfz mongodb-database-tools-debian92-x86_64-100.2.0.tgz

# Initialize the MongoDB database (from host)
[utils]$ ./dbinit.sh

WARNING: In 2 seconds, this will (re-)initialize the waptrunner DB. You may lose existing project data! Press CTRL-C to quit...

-- Executing this in container : free -h...
              total        used        free      shared  buff/cache   available
Mem:           1.9G        510M         98M        464K        1.3G        1.3G
Swap:          1.0G        130M        893M

-- Executing this in container : ls /app/dbinit/waptrunner...
cwe.bson           issues.metadata.json   testkb.bson
cwe.metadata.json  project.bson           testkb.metadata.json
issues.bson        project.metadata.json

-- Executing this in container : /usr/bin/mongorestore --db=waptrunner --drop --host 127.0.0.1:27017 /app/dbinit/waptrunner...
2020-11-10T15:39:34.880+0000    The --db and --collection flags are deprecated for this use-case; please use --nsInclude instead, i.e. with --nsInclude=${DATABASE}.${COLLECTION}
2020-11-10T15:39:34.881+0000    building a list of collections to restore from /app/dbinit/waptrunner dir
2020-11-10T15:39:34.896+0000    reading metadata for waptrunner.cwe from /app/dbinit/waptrunner/cwe.metadata.json
2020-11-10T15:39:34.905+0000    reading metadata for waptrunner.issues from /app/dbinit/waptrunner/issues.metadata.json
2020-11-10T15:39:34.919+0000    reading metadata for waptrunner.project from /app/dbinit/waptrunner/project.metadata.json
2020-11-10T15:39:34.942+0000    reading metadata for waptrunner.testkb from /app/dbinit/waptrunner/testkb.metadata.json
2020-11-10T15:39:34.946+0000    restoring waptrunner.cwe from /app/dbinit/waptrunner/cwe.bson
2020-11-10T15:39:34.970+0000    restoring waptrunner.issues from /app/dbinit/waptrunner/issues.bson
2020-11-10T15:39:34.990+0000    restoring indexes for collection waptrunner.issues from metadata
2020-11-10T15:39:35.001+0000    restoring waptrunner.project from /app/dbinit/waptrunner/project.bson
2020-11-10T15:39:35.011+0000    restoring indexes for collection waptrunner.project from metadata
2020-11-10T15:39:35.018+0000    restoring waptrunner.testkb from /app/dbinit/waptrunner/testkb.bson
2020-11-10T15:39:35.108+0000    finished restoring waptrunner.project (1 document, 0 failures)
2020-11-10T15:39:35.119+0000    finished restoring waptrunner.issues (79 documents, 0 failures)
2020-11-10T15:39:35.125+0000    no indexes to restore
2020-11-10T15:39:35.131+0000    finished restoring waptrunner.cwe (994 documents, 0 failures)
2020-11-10T15:39:35.151+0000    no indexes to restore
2020-11-10T15:39:35.151+0000    finished restoring waptrunner.testkb (2704 documents, 0 failures)
2020-11-10T15:39:35.151+0000    3778 document(s) restored successfully. 0 document(s) failed to restore.
```

### When needed backup your database

```bash
# From host, backup via mongodump
[utils]$ ./backup-container-db.sh
Back-up MongoDB to directory /app/backup/waptrunner.20201110.19995 in waptrdb container? [n] y
2020-11-10T15:40:44.928+0000    writing waptrunner.cwe to /app/backup/waptrunner.20201110.19995/waptrunner/cwe.bson
2020-11-10T15:40:44.929+0000    writing waptrunner.project to /app/backup/waptrunner.20201110.19995/waptrunner/project.bson
2020-11-10T15:40:44.934+0000    writing waptrunner.issues to /app/backup/waptrunner.20201110.19995/waptrunner/issues.bson
2020-11-10T15:40:44.942+0000    writing waptrunner.testkb to /app/backup/waptrunner.20201110.19995/waptrunner/testkb.bson
2020-11-10T15:40:44.981+0000    done dumping waptrunner.project (1 document)
2020-11-10T15:40:45.182+0000    done dumping waptrunner.issues (79 documents)
2020-11-10T15:40:46.223+0000    done dumping waptrunner.testkb (2704 documents)
2020-11-10T15:40:47.154+0000    done dumping waptrunner.cwe (994 documents)
View content of backup directory /app/backup/waptrunner.20201110.19995 [n] y
/app/backup/waptrunner.20201110.19995:
total 0
drwxr-xr-x 10 root root 320 Nov 10 15:40 waptrunner

/app/backup/waptrunner.20201110.19995/waptrunner:
total 5844
-rw-r--r-- 1 root root 3501866 Nov 10 15:40 cwe.bson
-rw-r--r-- 1 root root     150 Nov 10 15:40 cwe.metadata.json
-rw-r--r-- 1 root root  273691 Nov 10 15:40 issues.bson
-rw-r--r-- 1 root root     289 Nov 10 15:40 issues.metadata.json
-rw-r--r-- 1 root root     186 Nov 10 15:40 project.bson
-rw-r--r-- 1 root root     248 Nov 10 15:40 project.metadata.json
-rw-r--r-- 1 root root 1393052 Nov 10 15:40 testkb.bson
-rw-r--r-- 1 root root     153 Nov 10 15:40 testkb.metadata.json

# From host, export to CSV via mongoexport
[utils]$ ./mongoexport.sh
Do you want the operation on local DB (mongodb://waptrdb:27017/waptrunner)? [y]:

-- Exporting data from testkb collection to /app/data/testkb.csv...
2020-11-10T15:43:06.496+0000    connected to: mongodb://waptrdb:27017/waptrunner
2020-11-10T15:43:07.095+0000    exported 2704 records

-- Exporting data from issues collection to /app/data/issues.csv...
2020-11-10T15:43:08.068+0000    connected to: mongodb://waptrdb:27017/waptrunner
2020-11-10T15:43:08.166+0000    exported 79 records

-- Exporting data from project collection to /app/data/project.csv...
2020-11-10T15:43:09.111+0000    connected to: mongodb://waptrdb:27017/waptrunner
2020-11-10T15:43:09.134+0000    exported 1 record

-- Exporting data from cwe collection to /app/data/cwe.csv...
2020-11-10T15:43:10.110+0000    connected to: mongodb://waptrdb:27017/waptrunner
2020-11-10T15:43:11.112+0000    [........................]  waptrunner.cwe  0/994  (0.0%)
2020-11-10T15:43:11.341+0000    [########################]  waptrunner.cwe  994/994  (100.0%)
2020-11-10T15:43:11.341+0000    exported 994 records
```

### When needed add TestKB data (e.g. using Excel)

```bash
# From host, after editing data/testkb.csv in Excel
mac[utils]$ ./mongoimport.sh
Do you want the operation on local DB (mongodb://waptrdb:27017/waptrunner)? [y]:
-- Import data to testkb collection from /app/data/testkb.csv? [n] y
```

### When needed, download new CWE data from Mitre and import it

```bash
# From host
[utils]$ ./import-cwe.sh
Do you want the operation on local DB (mongodb://waptrdb:27017/waptrunner)? [y]:
Tool path: ./mongodb-database-tools-debian92-x86_64-100.2.0/bin/mongoimport

-- Creating a new file /Users/eric_paquet/github/waptrun/utils/../data/cwe-data-from-mitre.csv

- Processing view 2000
- Downloading https://cwe.mitre.org/data/csv/2000.csv.zip
- Uncompressing 2000.csv.zip
Archive:  2000.csv.zip
  inflating: 2000.csv
- Removing zip file 2000.csv.zip
- Appending data from 2000.csv
Done building content in /Users/eric_paquet/github/waptrun/utils/../data/cwe-data-from-mitre.csv.

- Processing view 1026
- Downloading https://cwe.mitre.org/data/csv/1026.csv.zip
- Uncompressing 1026.csv.zip
Archive:  1026.csv.zip
  inflating: 1026.csv
- Removing zip file 1026.csv.zip
- Appending data from 1026.csv
Done building content in /Users/eric_paquet/github/waptrun/utils/../data/cwe-data-from-mitre.csv.

- Processing view 928
- Downloading https://cwe.mitre.org/data/csv/928.csv.zip
- Uncompressing 928.csv.zip
Archive:  928.csv.zip
  inflating: 928.csv
- Removing zip file 928.csv.zip
- Appending data from 928.csv
Done building content in /Users/eric_paquet/github/waptrun/utils/../data/cwe-data-from-mitre.csv.

-- Run mongoimport for CWE list? [n] y
2020-11-10T15:47:40.800+0000    connected to: mongodb://waptrdb:27017/waptrunner
2020-11-10T15:47:40.802+0000    dropping: waptrunner.cwe
2020-11-10T15:47:41.127+0000    994 document(s) imported successfully. 0 document(s) failed to import.
```

### When needed, use the mongo shell

```bash
[utils]$ ./mongo.sh
Do you want the operation on local DB (mongodb://waptrdb:27017/waptrunner)? [y]:
MongoDB shell version v4.4.1
connecting to: mongodb://waptrdb:27017/waptrunner?compressors=disabled&gssapiServiceName=mongodb
Implicit session: session { "id" : UUID("87df9521-786d-43c0-b665-191bdac4f130") }
MongoDB server version: 4.4.1
Welcome to the MongoDB shell.
[...]
```

### Browse to the app

Browse to http://localhost:5000

### Stop App and DB containers

```bash
$ docker-compose stop
```

## Basic Idea

This project was initiated when I started spending more time doing app security testing. I felt challenged trying to streamline my testing while trying to maximize coverage, trying to avoid missing special stuff and trying to capture useful findings without getting bogged down. In other words, I needed something to help keep my mind free, focused and engaged while not missing the capture of manual findings along the way.

Methodologies are supposed to be good for test streamlining but they are traditionally not that good at reducing the time it takes to test and they prevent us from adjusting our strategy based on signs of weaknesses and choosing the right rabbit hole. However, I have to say that The Bug Hunter Methodology is the closest thing I can think of that can qualify as a nearly-repetitive and methodical hacker approach. But it doesn't help to capture the results and stay focused by completing a testing mandate. The missing link is a targeted tool to avoid losing context while testing by capturing findings easily and iteratively.

## Design focus

The above Basic Idea was a statement of a bug hunter's frustrations that needed to be translated into a Design. Requirements and Design are blurred voluntarily to avoid losing track of _the thing_ to build.

The tool's design approach considered the Web App Pen Testing Workflow and Security Tester User Experience requirements.

### Phase 1

Define the test project scope and perform some high-level footprinting and architectural analysis. Fill the first project level (project page). Help put yourself in a test strategy mode.

![Project Details](screenshots/p1.png)

### Phase 2

Do your natural app mapping/discovery/inspection by using the app and looking at the traffic in Burp. Use some of the first set of listed tests (from OWASP Testing Guide, Portswigger, Bug Hunter's Methodology) to remind yourself of important stuff to avoid closing down your mind on testing options. Get tactical. Understand the technology and design choices that were made while building the AUT:

![Browse for Tests](screenshots/p2a.png).

If browsing for a test is too cumbersome, search for it:

![Search for Tests](screenshots/p2b.png).

If you consider that a test is missing, add it:

![Adding new Tests](screenshots/p2c.png).

### Phase 3

Once you have enough payloads, perform some targeted scanning from interesting requests. Save important scanner issues into the tool as Issues (use Burp Clipboarder extension to populate various fields with issue data). These automated test results will help build attack scenarios or think of manual tests to conduct.

![Testing Screen](screenshots/p3.png).

### Phase 4

Execute some targeted manual tests. Look at the scanner findings, use your judgment from the technology, your gut feel and experience. Capture the interesting findings and dig deeper later. Copy/paste payloads into the Evidence field.

Capture screenshots and paste them into the Paste Area field.

![Paste Screenshots](screenshots/p4.png)

### Phase 5

Look at all accumulated results and try to build a successful attack that'll compromise the system or provide sufficient worry about the security of the system. Capture payloads and screenshots and explain the risk. Search for the closest CWE that provides background for the issue and add our expert opinions.

![CWE Search](screenshots/p5.png)

Add notes by filling the template to explain the issue in details, the risk, the impact, etc.

![Add Notes](screenshots/p5b.png)

### Phase 6

Generate a report and review it. Tweak your findings and regenerate the report. Submit your report and call a review meeting after the team has had a chance to review or even comment on the report.

Export to a single-file HTML for easy pasting or attachment into emails or ticketing systems:

![HTML Report](screenshots/p6a.png)

Export to CSV to help PMs with remediation tracking:

![CSV Report](screenshots/p6b.png)

## Additional Criteria

-   Keep the app's window small and useful. Use field auto-expansion to avoid scrolling and to provide a compact snapshot of results.
-   Avoid too many clicks by keeping all inputs in a single window and use UI automations and artifacts (mouse hovering, links).
-   Separate field for Severity and Priority. The latter is representative of risk and other factors that should adjust how quickly we should implement a fix.
-   Keep history of remediated issues (use Priority = Remediated)

Resulting page with TestKB, Generic Issue Data, Specific Issue Data and Issue List:

![Compact Test Runner](screenshots/c1.png)

## Current Features

-   Multi-project
-   Multi-methodology
-   Test stepping
-   Dynamic Test KB updates
-   Dynamic, color-coded issue list, per project
-   Auto-type test names and CWEs
-   Ability to add new tests based on new CVEs or other
-   CVE search on cvedetails.com
-   Export to CSV and HTML from UI
-   Import Burp issues from my Clipboarder Burp App. To use it:
    -   Download my [Clipboarder extension](https://github.com/jourzero/clipboarder/blob/master/dist/Clipboarder.jar)
    -   Add Clipboarder extension to Burp
    -   Select one issue from Target/Issues
    -   Use context menu "Copy as free text to clipboard"
    -   Paste clipboard content into WAPT Runner's Notes field
    -   Result: Burp issue text will be parsed and UI fields like Issue Name, Evidence, Severity, Priority will be adjusted accordingly.
-   Import screenshots from clipboard and paste them into the Paste Area as HTML5 Base64 images.
    -   Screenshots are shown when viewing an issue from the issue list.
    -   Screenshots are included in reports.
-   User Authentication with Passport, and MongoDB.
-   Serve static content with Express.js
-   App was dockerized.

## IMPORTANT NOTE

-   Without a starting MongoDB dataset, this app is useless for anyone else but me. See [Issues](https://github.com/jourzero/waptrun/issues).

## Snyk Results

[![Known Vulnerabilities](https://snyk.io/test/github/jourzero/waptrun/badge.svg)](https://snyk.io/test/github/jourzero/waptrun)
