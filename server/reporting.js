require("dotenv").config();
const marked = require("marked");
const config = require("./config.js");
const logger = require("./lib/appLogger.js");
const db = require("./models");

// Width of Left Menu in HTML report
const menuWidth = "300px";
const menuMaxTextLen = 45;

// Set markdown options
marked.setOptions({
    pedantic: false,
    gfm: true,
    tables: true,
    breaks: false,
    sanitize: false,
    smartLists: true,
    smartypants: false,
    xhtml: false,
});

// Generate issue report for a specific project in CSV format
exports.genPrjIssueReportCSV = function (req, res) {
    let prjName = req.params.PrjName;
    let filename = prjName + "-issues.csv";
    let fileData = "";

    let ok = function (records) {
        logger.debug("Got " + records.length + " issue records for project " + prjName);
        fileData += toCsv(records);
        res.set("Content-type", "text/csv");
        res.set("Content-Disposition", "attachment; filename=" + filename);
        res.set("Content-Length", fileData.length);
        res.send(fileData);
    };
    let err = function (err) {
        res.status(404).send("Sorry, there was an error when exporting the data: " + err.message);
    };
    issue.findProjectIssues(req.params.PrjName, ok, err);
};

// Generate issue report for a specific project in CSV format
exports.genPrjIssueExportJSON = function (req, res) {
    let prjName = req.params.PrjName;
    let filename = prjName + "-issues.json";
    let fileData = "";

    let ok = function (records) {
        logger.debug("Got " + records.length + " issue records for project " + prjName);
        fileData += JSON.stringify(records, undefined, 2);
        res.set("Content-type", "application/json");
        res.set("Content-Disposition", "attachment; filename=" + filename);
        res.set("Content-Length", fileData.length);
        /* 
        TODO: CWE-80   Improper Neutralization of Script-Related HTML Tags in a Web Page (Basic XSS) 
        reporting.js: 56
        Severity: Medium
        Attack Vector: express.Response.send
        Number of Modules Affected: 1
        Description: This call to express.Response.send() contains a cross-site scripting (XSS) flaw. The application populates the HTTP response with untrusted input, allowing an attacker to embed malicious content, such as Javascript code, which will be executed in the context of the victim's browser. XSS vulnerabilities are commonly exploited to steal or manipulate cookies, modify presentation of content, and compromise confidential information, with new attack vectors being discovered on a regular basis.
        Remediation: Use contextual escaping on all untrusted data before using it to construct any portion of an HTTP response. The escaping method should be chosen based on the specific use case of the untrusted data, otherwise it may not protect fully against the attack. For example, if the data is being written to the body of an HTML page, use HTML entity escaping; if the data is being written to an attribute, use attribute escaping; etc. Both the OWASP Java Encoder library and the Microsoft AntiXSS library provide contextual escaping methods. For more details on contextual escaping, see https://github.com/OWASP/CheatSheetSeries/blob/master/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.md. In addition, as a best practice, always validate untrusted input to ensure that it conforms to the expected format, using centralized data validation routines when possible.
        */
        res.send(fileData);
    };
    let err = function (err) {
        res.status(404).send("Sorry, there was an error when exporting the data: " + err.message);
    };
    issue.findProjectIssues(req.params.PrjName, ok, err);
};

// Generate findings issue report for a specific project in HTML format
exports.genPrjIssueFindingsReportHtml = function (req, res) {
    let showAllIssues = false;
    genFindingsReportHtml(req, res, showAllIssues);
};

// Generate full issue report for a specific project in HTML format
exports.genPrjIssueFullReportHtml = function (req, res) {
    let showAllIssues = true;
    genFindingsReportHtml(req, res, showAllIssues);
};

// Export all Issue data to CSV format
exports.exportIssuesCSV = function (req, res) {
    let filename = "all-issues.csv";
    let fileData = "";
    let ok = function (records) {
        logger.debug("Got " + records.length + " issue records");
        fileData += toCsv(records);
        res.set("Content-type", "text/csv");
        res.set("Content-Disposition", "attachment; filename=" + filename);
        res.set("Content-Length", fileData.length);
        res.send(fileData);
    };
    let err = function (err) {
        res.status(404).send("Sorry, there was an error when exporting: " + err.message);
    };
    issue.findAll(ok, err);
};

function genFindingsReportHtml(req, res, showAllIssues) {
    let prjName = req.params.PrjName;
    let filename = prjName + "-issues.html";
    let fileData = "";

    // Fetch project document from project collection
    /*
    let prjColl = db.get("project");
    let issueColl = db.get("issues");
    */

    //prjColl.findOne({name: prjName})
    db.project
        .findOne({where: {name: prjName}})
        .then((prj) => {
            //issueColl.find({PrjName: prjName}, {sort: {IPriority: 1, TIssueName: 1}}).then((records) => {
            db.issue
                .findAll({
                    where: {PrjName: prjName},
                    order: [
                        ["IPriority", "DESC"],
                        ["TIssueName", "ASC"],
                        ["TID", "ASC"],
                    ],
                })
                .then((records) => {
                    logger.debug("Got " + records.length + " issue records for project " + prjName);
                    fileData += toHtml(records, prjName, prj, showAllIssues);
                    res.set("Content-type", "text/html");
                    res.set("Content-Disposition", "attachment; filename=" + filename);
                    res.set("Content-Length", fileData.length);
                    res.send(fileData);
                });
        })
        .catch((err) => {
            res.status(404).send("Sorry, there was an error when generating the report: " + err.message);
        });
}

/**
 * Converts a value to a string appropriate for entry into a CSV table (surrounded by quotes).
 * @param {string|number|object} theValue
 * @param {string} sDelimiter The string delimiter.  Defaults to a double quote (") if omitted.
 */
function toCsvValue(theValue, sDelimiter) {
    let t = typeof theValue,
        output;
    if (theValue === null) theValue = "";
    theValue = String(theValue);
    theValue = theValue.replace(/"/g, '""');

    if (typeof sDelimiter === "undefined" || sDelimiter === null) {
        sDelimiter = '"';
    }

    if (t === "undefined") {
        output = "";
    } else if (t === "string") {
        output = sDelimiter + theValue + sDelimiter;
    } else {
        output = String(theValue);
    }

    return output;
}

/**
 * Converts an array of objects (with identical schemas) into a CSV table.
 * @param {Array} objArray An array of objects.  Each object in the array must have the same property list.
 * @param {string} sDelimiter The string delimiter.  Defaults to a double quote (") if omitted.
 * @param {string} cDelimiter The column delimiter.  Defaults to a comma (,) if omitted.
 * @return {string} The CSV equivalent of objArray.
 */
function toCsv(objArray, sDelimiter, cDelimiter) {
    let i,
        l,
        names = [],
        name,
        value,
        obj,
        row,
        output = "",
        n,
        nl;

    // Initialize default parameters.
    if (typeof sDelimiter === "undefined" || sDelimiter === null) {
        sDelimiter = '"';
    }
    if (typeof cDelimiter === "undefined" || cDelimiter === null) {
        cDelimiter = ",";
    }

    for (i = 0, l = objArray.length; i < l; i += 1) {
        // Get the names of the properties.
        obj = objArray[i];
        row = "";
        if (i === 0) {
            // Loop through the names
            for (name in obj) {
                if (obj.hasOwnProperty(name)) {
                    if (name !== "IEvidence" && name !== "IScreenshots") {
                        // && (name !== 'INotes')){
                        names.push(name);
                        row += [sDelimiter, name, sDelimiter, cDelimiter].join("");
                    }
                }
            }
            row = row.substring(0, row.length - 1);
            output += row;
        }

        output += "\n";
        row = "";
        for (n = 0, nl = names.length; n < nl; n += 1) {
            name = names[n];
            if (name !== "IEvidence" && name !== "IScreenshots") {
                // && (name !== 'INotes')){
                value = obj[name];
                if (n > 0) {
                    row += cDelimiter;
                }
                row += toCsvValue(value, '"');
            }
        }
        output += row;
    }

    return output;
}

/**
 * Converts an array of objects (with identical schemas) into HTML
 * @param {Array}  objArray  An array of objects.  Each object in the array must have the same property list.
 * @param {String} prjName   Name of project
 * @param {Object} prj       Project object
 * @param {Boolean} showAllIssues   Show all findings, even remediated ones?
 * @param {Boolean} includeMenu     Include the left pane menu in the report?
 * @return {string} The CSV equivalent of objArray.
 */
function toHtml(objArray, prjName, prj, showAllIssues, includeMenu = true) {
    let obj = {};
    let title = "Security Testing Report";
    let priority = "N/A",
        prevPrio = "",
        prio = -1;
    let cweUriBase = "https://cwe.mitre.org/data/definitions/";
    const escapeSeqArrowRight = "\25B8";
    const escapeSeqArrowDown = "\25BE";

    //.pure-menu-has-children .pure-menu-link:after{padding-left:.5em;content:"\25B8";font-size:small}
    //.pure-menu-horizontal .pure-menu-has-children>.pure-menu-link:after{content:"\25BE"}
    let output = `<!doctype html>
<html lang="en">
<head>\n<title>${title}</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>td,th{max-width:700px;vertical-align:top;}img{max-height:700px;max-width:700px;height:auto;width:auto;border:1px dashed DarkSlateBlue;}.CriticalP{background-color:#C00;color:white;}.HighP{background-color:orange;color:white;}.MediumP{background-color:yellow;color:black;}.LowP{background-color:cyan;color:black;}.TestedP{background-color:lightgreen;color:black;}.FixedP{background-color:lightgreen;color:black;}.TODOP{background-color:lightcyan;color:black;}.InfoP{background-color:lightgray;color:black;}.greybg{background-color:#dddddd;font-size:11px}.evidencetext{word-break:break-all;font-size:11px;line-height:1em;}</style>
  <style>td,th{padding:0}html{font-family:sans-serif;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%}body{margin:0}article,aside,details,figcaption,figure,footer,header,hgroup,main,menu,nav,section,summary{display:block}audio,canvas,progress,video{display:inline-block;vertical-align:baseline}audio:not([controls]){display:none;height:0}[hidden],template{display:none}a{background-color:transparent}a:active,a:hover{outline:0}abbr[title]{border-bottom:1px dotted}b,optgroup,strong{font-weight:700}dfn{font-style:italic}h1{font-size:2em;margin:.67em 0}mark{background:#ff0;color:#000}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sup{top:-.5em}sub{bottom:-.25em}svg:not(:root){overflow:hidden}figure{margin:1em 40px}hr{box-sizing:content-box;height:0}pre,textarea{overflow:auto}code,kbd,pre,samp{font-family:monospace,monospace;font-size:1em}button,input,optgroup,select,textarea{color:inherit;font:inherit;margin:0}button{overflow:visible}button,select{text-transform:none}button,html input[type=button],input[type=reset],input[type=submit]{-webkit-appearance:button;cursor:pointer}button[disabled],html input[disabled]{cursor:default}button::-moz-focus-inner,input::-moz-focus-inner{border:0;padding:0}input{line-height:normal}input[type=checkbox],input[type=radio]{box-sizing:border-box;padding:0}input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{height:auto}input[type=search]{-webkit-appearance:textfield;box-sizing:content-box}input[type=search]::-webkit-search-cancel-button,input[type=search]::-webkit-search-decoration{-webkit-appearance:none}fieldset{border:1px solid silver;margin:0 2px;padding:.35em .625em .75em}table{border-collapse:collapse;border-spacing:0}.hidden,[hidden]{display:none!important}.pure-img{max-width:100%;height:auto;display:block}.pure-g{letter-spacing:-.31em;text-rendering:optimizespeed;font-family:FreeSans,Arimo,"Droid Sans",Helvetica,Arial,sans-serif;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-flex-flow:row wrap;-ms-flex-flow:row wrap;flex-flow:row wrap;-webkit-align-content:flex-start;-ms-flex-line-pack:start;align-content:flex-start}@media all and (-ms-high-contrast:none),(-ms-high-contrast:active){table .pure-g{display:block}}.opera-only :-o-prefocus,.pure-g{word-spacing:-.43em}.pure-u,.pure-u-1,.pure-u-1-1,.pure-u-1-12,.pure-u-1-2,.pure-u-1-24,.pure-u-1-3,.pure-u-1-4,.pure-u-1-5,.pure-u-1-6,.pure-u-1-8,.pure-u-10-24,.pure-u-11-12,.pure-u-11-24,.pure-u-12-24,.pure-u-13-24,.pure-u-14-24,.pure-u-15-24,.pure-u-16-24,.pure-u-17-24,.pure-u-18-24,.pure-u-19-24,.pure-u-2-24,.pure-u-2-3,.pure-u-2-5,.pure-u-20-24,.pure-u-21-24,.pure-u-22-24,.pure-u-23-24,.pure-u-24-24,.pure-u-3-24,.pure-u-3-4,.pure-u-3-5,.pure-u-3-8,.pure-u-4-24,.pure-u-4-5,.pure-u-5-12,.pure-u-5-24,.pure-u-5-5,.pure-u-5-6,.pure-u-5-8,.pure-u-6-24,.pure-u-7-12,.pure-u-7-24,.pure-u-7-8,.pure-u-8-24,.pure-u-9-24{display:inline-block;zoom:1;letter-spacing:normal;word-spacing:normal;vertical-align:top;text-rendering:auto}.pure-g [class*=pure-u]{font-family:sans-serif}.pure-u-1-24{width:4.1667%}.pure-u-1-12,.pure-u-2-24{width:8.3333%}.pure-u-1-8,.pure-u-3-24{width:12.5%}.pure-u-1-6,.pure-u-4-24{width:16.6667%}.pure-u-1-5{width:20%}.pure-u-5-24{width:20.8333%}.pure-u-1-4,.pure-u-6-24{width:25%}.pure-u-7-24{width:29.1667%}.pure-u-1-3,.pure-u-8-24{width:33.3333%}.pure-u-3-8,.pure-u-9-24{width:37.5%}.pure-u-2-5{width:40%}.pure-u-10-24,.pure-u-5-12{width:41.6667%}.pure-u-11-24{width:45.8333%}.pure-u-1-2,.pure-u-12-24{width:50%}.pure-u-13-24{width:54.1667%}.pure-u-14-24,.pure-u-7-12{width:58.3333%}.pure-u-3-5{width:60%}.pure-u-15-24,.pure-u-5-8{width:62.5%}.pure-u-16-24,.pure-u-2-3{width:66.6667%}.pure-u-17-24{width:70.8333%}.pure-u-18-24,.pure-u-3-4{width:75%}.pure-u-19-24{width:79.1667%}.pure-u-4-5{width:80%}.pure-u-20-24,.pure-u-5-6{width:83.3333%}.pure-u-21-24,.pure-u-7-8{width:87.5%}.pure-u-11-12,.pure-u-22-24{width:91.6667%}.pure-u-23-24{width:95.8333%}.pure-u-1,.pure-u-1-1,.pure-u-24-24,.pure-u-5-5{width:100%} .pure-table{border-collapse:collapse;border-spacing:0;empty-cells:show;border:1px solid #cbcbcb}.pure-table caption{color:#000;font:italic 85%/1 arial,sans-serif;padding:1em 0;text-align:center}.pure-table td,.pure-table th{border-left:1px solid #cbcbcb;border-width:0 0 0 1px;font-size:inherit;margin:0;overflow:visible;padding:.5em 1em}.pure-table td:first-child,.pure-table th:first-child{border-left-width:0}.pure-table thead{background-color:#e0e0e0;color:#000;text-align:left;vertical-align:bottom}.pure-table td{background-color:transparent}.pure-table-odd td,.pure-table-striped tr:nth-child(2n-1) td{background-color:#f2f2f2}.pure-table-bordered td{border-bottom:1px solid #cbcbcb}.pure-table-bordered tbody>tr:last-child>td{border-bottom-width:0}.pure-table-horizontal td,.pure-table-horizontal th{border-width:0 0 1px;border-bottom:1px solid #cbcbcb}.pure-table-horizontal tbody>tr:last-child>td{border-bottom-width:0}.pure-menu{box-sizing:border-box}.pure-menu-fixed{position:fixed;left:0;top:0;z-index:3}.pure-menu-item,.pure-menu-list{position:relative}.pure-menu-list{list-style:none;margin:0;padding:0}.pure-menu-item{padding:0;margin:0;height:100%}.pure-menu-heading,.pure-menu-link{display:block;text-decoration:none;white-space:nowrap;font-size:12px}.pure-menu-horizontal{width:100%;white-space:nowrap}.pure-menu-horizontal .pure-menu-list{display:inline-block}.pure-menu-horizontal .pure-menu-heading,.pure-menu-horizontal .pure-menu-item,.pure-menu-horizontal .pure-menu-separator{display:inline-block;zoom:1;vertical-align:middle}.pure-menu-item .pure-menu-item{display:block}.pure-menu-children{display:none;position:absolute;left:100%;top:0;margin:0;padding:0;z-index:3}.pure-menu-horizontal .pure-menu-children{left:0;top:auto;width:inherit}.pure-menu-active>.pure-menu-children,.pure-menu-allow-hover:hover>.pure-menu-children{display:block;position:absolute}.pure-menu-has-children>.pure-menu-link:after{padding-left:.5em;content:"${escapeSeqArrowRight}";font-size:small}.pure-menu-horizontal .pure-menu-has-children>.pure-menu-link:after{content:"${escapeSeqArrowDown}"}.pure-menu-scrollable{overflow-y:scroll;overflow-x:hidden}.pure-menu-scrollable .pure-menu-list{display:block}.pure-menu-horizontal.pure-menu-scrollable .pure-menu-list{display:inline-block}.pure-menu-horizontal.pure-menu-scrollable{white-space:nowrap;overflow-y:hidden;overflow-x:auto;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;padding:.5em 0}.pure-menu-horizontal.pure-menu-scrollable::-webkit-scrollbar{display:none}.pure-menu-horizontal .pure-menu-children .pure-menu-separator,.pure-menu-separator{background-color:#ccc;height:1px;margin:.3em 0}.pure-menu-horizontal .pure-menu-separator{width:1px;height:1.3em;margin:0 .3em}.pure-menu-horizontal .pure-menu-children .pure-menu-separator{display:block;width:auto}.pure-menu-heading{text-transform:uppercase;color:#565d64}.pure-menu-link{color:#777}.pure-menu-children{background-color:#fff}.pure-menu-disabled,.pure-menu-heading,.pure-menu-link{padding:.5em 1em}.pure-menu-disabled{opacity:.5}.pure-menu-disabled .pure-menu-link:hover{background-color:transparent}.pure-menu-active>.pure-menu-link,.pure-menu-link:focus,.pure-menu-link:hover{background-color:#eee}.pure-menu-selected .pure-menu-link,.pure-menu-selected .pure-menu-link:visited{color:#000}body { color: #777; } .pure-img-responsive { max-width: 100%; height: auto; } #layout, #menu, .menu-link { -webkit-transition: all 0.2s ease-out; -moz-transition: all 0.2s ease-out; -ms-transition: all 0.2s ease-out; -o-transition: all 0.2s ease-out; transition: all 0.2s ease-out; } #layout { position: relative; left: 0; padding-left: 0; }#layout.active #menu { left: 300px; width: 300px; } #layout.active .menu-link { left: 300px; } .content { margin: 0 auto; padding: 0 2em; max-width: 800px; margin-bottom: 50px; line-height: 1.6em; } .header { margin: 0; color: #333; text-align: center; padding: 2.5em 2em 0; border-bottom: 1px solid #eee; } .header h1 { margin: 0.2em 0; font-size: 3em; font-weight: 300; } .header h2 { font-weight: 300; color: #ccc; padding: 0; margin-top: 0; } .content-subhead { margin: 50px 0 20px 0; font-weight: 300; color: #888; }#menu { margin-left: -300px; width: 300px; position: fixed; top: 0; left: 0; bottom: 0; z-index: 1000; background: #191818; overflow-y: auto; -webkit-overflow-scrolling: touch; } #m a { olor: #999; border: none; padding: 0.6em 0 0.6em 0.6em; } #menu .pure-menu, #menu .pure-menu ul { border: none; background: transparent; } #menu .pure-menu ul, #menu .pure-menu .menu-item-divided { border-top: 1px solid #333; } #menu .pure-menu li a:hover, #menu .pure-menu li a:focus { background: #333; } #menu .pure-menu-selected, #menu .pure-menu-heading { background: #1f8dd6; } #menu .pure-menu-selected a { color: #fff; } #menu .pure-menu-heading { font-size: 100%; color: #fff; margin: 0; } .menu-link { position: fixed; display: block; top: 0; left: 0; background: #000; background: rgba(0,0,0,0.7); font-size: 10px; z-index: 10; width: 2em; height: auto; padding: 2.1em 1.6em; } .menu-link:hover, .menu-link:focus { background: #000; } .menu-link span { position: relative; display: block; } .menu-link span, .menu-link span:before, .menu-link span:after { background-color: #fff; width: 100%; height: 0.2em; } .menu-link span:before, .menu-link span:after { position: absolute; margin-top: -0.6em; content: " "; } .menu-link span:after { margin-top: 0.6em; }@media (min-width: 48em) { .header, .content { padding-left: 2em; padding-right: 2em; } #layout { padding-left: 300px; left: 0; } #menu { left: 300px; } .menu-link { position: fixed; left: 300px; display: none; } #layout.active .menu-link { left: 300px; } } @media (max-width: 48em) { #layout.active { position: relative; left: 300px; } }</style>
  <style>h2{font-size:18px;} h3{margin-top:0;margin-bottom:0;font-size:16px;}</style>
</head>
<body>\n`;

    // Use side-menu layout from https://purecss.io.
    // Create the Layout div (Level 1 div)
    if (includeMenu) {
        output += '<div id="layout">\n<a href="#menu" id="menuLink" class="menu-link">\n<span></span></a>\n';

        // Add Menu div (level 2)
        output += '<div id="menu">\n';

        // Add menu content (level 3)
        output += '<div class="pure-menu">\n';
        output += '<a class="pure-menu-heading" href="#">Findings</a>\n';

        // Add list for issues
        output += '<ul class="pure-menu-list">\n';

        // Add menu items for each issue (issue summary)
        for (let i = 0; i < objArray.length; i++) {
            obj = objArray[i];
            prevPrio = priority;
            priority = obj.IPriorityText;
            prio = parseInt(obj.IPriority);

            // Decide which priorities to keep in the report
            // Priority values: 1:Critical, 2:High, 3:Medium, 4:Low, 5:Info, 6:TODO, 7:Fixed, 8:Tested, 9:Exclude
            // If all issues logged need to be printed (for compliance reports), only skip the ones marked as "Exclude"
            if (showAllIssues && prio !== undefined && prio > 8) continue;
            // If only real issues (including informational) need to be printed, skip the tester notes (TODO, Tested, Fixed, Exclude)
            if (!showAllIssues && prio !== undefined && prio > 5) continue;

            // Count the number of URIs
            //let count = 0;
            //if (obj.IURIs !== undefined) count = obj.IURIs.split("\n").length;

            // Print each issue with the issue as the header and the details as part of a table.
            if (priority !== undefined && priority !== "" && priority !== prevPrio) {
                // Add priority link
                output += '<li class="pure-menu-item menu-item-divided"><a href="#' + priority + 'Priority" class="pure-menu-link">' + priority + " Priority</a></li>\n";
            }

            // Add list item for issue
            let issueName = obj.TIssueName;
            if (issueName.length >= menuMaxTextLen) {
                issueName = obj.TIssueName.substr(0, menuMaxTextLen - 3) + "...";
            }
            output += '<li class="pure-menu-item"><a href="#' + htmlEncode(obj.TID, true, 4, false) + '" class="pure-menu-link"> - ' + issueName + "</a></li>\n";
        }
        //output += "</tbody>\n</table>\n";
        output += "</ul>\n"; // Close list of menu items
        output += "</div>\n"; // close menu content div (level 3)
        output += "</div>\n"; // close menu div (level 2)
    }

    // Add Main div (level 2) to hold main content (as per side-menu layout from https://purecss.io)
    output += '<div id="main">\n<div class="header">\n<h1>' + title + "</h1>\n<h2>Project: " + prjName + "</h2>\n</div>\n\n";

    // Add Content div (level 3)
    output += '<div class="content">\n';

    // Add report intro
    output += '<h2 class="content-subhead">Intro</h2>\n\n';
    output += "<p>The below table contains a summary of the findings that were captured during manual security testing. ";
    output += "   Those findings should be combined with the results from automated scanning.";

    // Add project scope
    if (prj.notes) {
        let scope = marked.parse(prj.notes);
        output += '<h2 class="content-subhead">Scope</h2>\n\n';
        output += "<p>" + htmlEncode(scope, false, 4, true) + "</p>";
    } else {
        logger.warn(`Empty project notes in ${prjName} project`);
    }

    // Print detailed findings
    //output += '<h2 class="content-subhead">Findings</h2>\n';
    output += '<table class="pure-table-bordered">\n';
    for (let i = 0; i < objArray.length; i++) {
        obj = objArray[i];
        prevPrio = priority;
        priority = obj.IPriorityText;
        prio = parseInt(obj.IPriority);

        // Decide which priorities to keep in the report
        // Priority values: 1:Critical, 2:High, 3:Medium, 4:Low, 5:Info, 6:TODO, 7:Fixed, 8:Tested, 9:Exclude
        // If all issues logged need to be printed (for compliance reports), only skip the ones marked as "Exclude"
        if (showAllIssues && prio !== undefined && prio > 8) continue;
        // If only real issues (including informational) need to be printed, skip the tester notes (TODO, Tested, Fixed, Exclude)
        if (!showAllIssues && prio !== undefined && prio > 5) continue;

        // Add a row for each priority (for jumping from menu)
        if (priority !== undefined && priority !== "" && priority !== prevPrio) {
            output += `<tr class='${priority}P'><th id='${priority}Priority'>&nbsp;</th><th><h2>${priority} Priority Findings</h2></th></tr>\n`;
        }
        // Print each issue with the issue as the header and the details as part of a table.
        //output += "<tr><td>&nbsp;</td>" + "<th><h3 class='" + priority + "P' id='" + htmlEncode(obj.TID, true, 4, false) + "'>" + obj.TIssueName + "</h3></th></tr>\n";
        //output += "<tr><td>Issue Name</td>" + "<td><h3 id='" + htmlEncode(obj.TID, true, 4, false) + "'>" + obj.TIssueName + "</h3></td></tr>\n";
        output += `<tr><td>&nbsp;</td><td><h3 id='${htmlEncode(obj.TID, true, 4, false)}'>${obj.TIssueName}</h3></td></tr>\n`;

        // Print CWE ID and link to reference pages
        if (obj.CweId !== undefined && obj.CweId !== "")
            output +=
                //"<tr><th class='thID'>CWE ID: </th><td class='tdID'><a href='" +
                "<tr><td>CWE:</td><td><a href='" + cweUriBase + obj.CweId + ".html' target='refWin'>" + obj.CweId + "</a></td></tr>\n";

        // Print URIs where issue was discovered
        if (obj.IURIs && obj.IURIs !== "") {
            //output += "<tr><th class='thID'>URI(s): </th><td class='tdID'><ol>";
            output += "<tr><td>URI(s):</td><td><ol>";
            let uri = obj.IURIs.split("\n");
            for (let j = 0; j < uri.length; j++) {
                if (uri[j].length > 14) {
                    // TODO: sanitize link
                    output += "<li><a href='" + uri[j] + "'>" + htmlEncode(uri[j], true, 4, false) + "</a></li>\n";
                }
            }
            output += "</ol></td></tr>\n";
        }

        // Print severity text
        if (obj.TSeverityText !== undefined && obj.TSeverityText !== "" && prio >= 0)
            //output += "<tr><th class='thID'>Severity: </th><td class='tdID'>" + obj.TSeverityText + "</td></tr>\n";
            output += "<tr><td>Severity:</td><td>" + obj.TSeverityText + "</td></tr>\n";
        if (obj.IPriorityText !== undefined && obj.IPriorityText !== "")
            //output += "<tr><th class='thID'>Priority: </th><td class='tdID'>" + obj.IPriorityText + "</td></tr>\n";
            output += "<tr><td>Priority:</td><td>" + obj.IPriorityText + "</td></tr>\n";

        if (obj.TTRef !== undefined && obj.TTRef !== "") output += "<tr><td>Testing Ref.:</td><td><a href='" + obj.TTRef + "' target='refWin'>" + obj.TTRef + "</a></td></tr>\n";
        if (obj.TRef1 !== undefined && obj.TRef1 !== "") output += "<tr><td>Ref. 1:</td><td><a href='" + obj.TRef1 + "' target='refWin'>" + obj.TRef1 + "</a></td></tr>\n";
        if (obj.TRef2 !== undefined && obj.TRef2 !== "") output += "<tr><td>Ref. 2:</td><td><a href='" + obj.TRef2 + "' target='refWin'>" + obj.TRef2 + "</a></td></tr>\n";
        if (obj.INotes && obj.INotes !== "")
            //output += "<tr><th class='thID'>Notes: </th><td class='tdID'>" + marked(obj.INotes) + //htmlEncode(obj.INotes, true, 4, true) + "</td></tr>\n";
            output += "<tr><td>Notes:</td><td>" + marked.parse(obj.INotes) + "</td></tr>\n";
        if (obj.IEvidence && obj.IEvidence !== "") {
            let evidence = htmlEncode(obj.IEvidence, true, 4, false);

            // If keywords tag line "[KEYWORDS:KW1,KW2]" found, highlight all occurrences
            let keywordMatches = obj.IEvidence.match(/^\[KEYWORDS\:(.*)\]$/m);
            let keywords = [];
            if (keywordMatches !== undefined && keywordMatches !== null && keywordMatches.length > 1) {
                keywords = keywordMatches[1].split(",");
            }
            for (let i in keywords) {
                let re = new RegExp(keywords[i], "g");
                evidence = evidence.replace(re, `<mark>${keywords[i]}</mark>`);
                logger.debug("Marked all occurrences of keyword", keywords[i], "in", evidence);
            }

            //output += "<tr><th class='thID'>Evidence: </th><td class='tdID'>" + evidence + "</td></tr>\n";
            output += "<tr><td>Evidence:</td><td class='evidencetext'>" + evidence + "</td></tr>\n";
            //"<tr><th class='thID'>Evidence: </th><td class='tdID'><pre>" +
            //"</pre></td></tr>\n";
        }
        if (obj.IScreenshots !== undefined && obj.IScreenshots !== "") output += "<tr><td>Screenshot(s):</td><td>" + obj.IScreenshots + "</td></tr>\n";
        output += "<tr><td>&nbsp;</td><td>&nbsp;</td></tr>\n";
    }
    output += "</table>\n";
    output += "</div>\n"; // Content div (level 3)
    output += "</div>\n"; // Main div (level 2)
    output += "</div>\n"; // Layout div (level 1)
    // Add extra blank lines at the bottom of the report to allow menu jumping to the last issue
    output += "<br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>";
    output += "<br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>";
    output += "<br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>";
    output +=
        '<script>let links = document.getElementsByClassName("pure-menu-link"); let items = document.getElementsByClassName("pure-menu-item"); function clearItem(item) { item.classList.remove("pure-menu-selected"); }; function clearMenuSelections(){ for (let i = 0; i < items.length; i++) { clearItem(items[i]); } }; function refreshMenu(e){ clearMenuSelections(); e.target.parentElement.className; if (!e.target.parentElement.classList.contains("pure-menu-selected")){ e.target.parentElement.classList.add("pure-menu-selected"); } }; for (let i = 0; i < items.length; i++) { links[i].onclick = refreshMenu; };</script>\n';
    output += "</body>\n</html>\n";
    return output;
}

/*
HTMLEncode - Encode HTML special characters.
Copyright (c) 2006-2010 Thomas Peri, http://www.tumuski.com/
MIT License

jslint white: true, onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true 
 */

/**
 * HTML-Encode the supplied input
 *
 * @param {text}    source     The text to be encoded.
 * @param {boolean} display    The output is intended for display. If true, tabs will be expanded to the number of spaces
 *                             indicated by the 'tabs' argument. Also, line breaks will be converted to <br />.
 * @param {integer} tabs       The number of spaces to expand tabs to.  (Ignored when the 'display' parameter evaluates to false.)
 * @param {boolean} linkify    Linkify URLs when possible
 * @returns {Array|htmlEncode.result|String}
 */
let htmlEncode = function (source, display, tabs, linkify) {
    let i, s, ch, peek, line, result, next, endline, push, spaces;

    if (!source) return "";

    // Stash the next character and advance the pointer
    next = function () {
        peek = source.charAt(i);
        i += 1;
    };

    // Start a new "line" of output, to be joined later by <br />
    endline = function () {
        line = line.join("");
        if (display) {
            // If a line starts or ends with a space, it evaporates in html
            // unless it's an nbsp.
            line = line.replace(/(^ )|( $)/g, "&nbsp;");
        }
        result.push(line);
        line = [];
    };

    // Push a character or its entity onto the current line
    push = function () {
        if (ch < " " || ch > "~") {
            line.push("&#" + ch.charCodeAt(0) + ";");
        } else {
            line.push(ch);
        }
    };

    let toLink = function () {
        let replacePattern = /^- (\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
        source = source.replace(replacePattern, '- <a href="$1" target="refWin">$1</a>');
    };

    // If linkify is true, change URLs to links
    if (linkify) toLink();

    // Use only integer part of tabs, and default to 4
    tabs = tabs >= 0 ? Math.floor(tabs) : 4;

    result = [];
    line = [];

    i = 0;
    next();
    while (i <= source.length) {
        // less than or equal, because i is always one ahead
        ch = peek;
        next();

        // HTML special chars.
        switch (ch) {
            case "<":
                linkify ? push(ch) : line.push("&lt;");
                break;
            case ">":
                linkify ? push(ch) : line.push("&gt;");
                break;
            case "&":
                linkify ? push(ch) : line.push("&amp;");
                break;
            case '"':
                linkify ? push(ch) : line.push("&quot;");
                break;
            case "'":
                linkify ? push(ch) : line.push("&#39;");
                break;
            default:
                // If the output is intended for display,
                // then end lines on newlines, and replace tabs with spaces.
                if (display) {
                    switch (ch) {
                        case "\r":
                            // If this \r is the beginning of a \r\n, skip over the \n part.
                            if (peek === "\n") {
                                next();
                            }
                            line.push('<span class="greybg">&nbsp;</span>');
                            endline();
                            break;
                        case "\n":
                            line.push('<span class="greybg">&nbsp;</span>');
                            endline();
                            break;
                        case "\t":
                            // expand tabs
                            spaces = tabs - (line.length % tabs);
                            for (s = 0; s < spaces; s += 1) {
                                line.push(" ");
                            }
                            break;
                        default:
                            // All other characters can be dealt with generically.
                            push();
                    }
                } else {
                    // If the output is not for display,
                    // then none of the characters need special treatment.
                    push();
                }
        }
    }
    endline();

    // Add line breaks
    result = result.join("<br />");

    if (display) {
        // Break up contiguous blocks of spaces with non-breaking spaces
        result = result.replace(/ {2}/g, " &nbsp;");
    }

    // tada!
    return result;
};
