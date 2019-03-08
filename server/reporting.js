var issue = require("./IssueModel")();

// Generate issue report for a specific project in CSV format
exports.genPrjIssueReportCSV = function(req, res) {
    var prjName = req.params.prjName;
    var filename = prjName + "-issues.csv";
    var fileData = "";

    var ok = function(records) {
        console.log("Got " + records.length + " issue records for project " + prjName);
        fileData += toCsv(records);
        res.set("Content-type", "text/csv");
        res.set("Content-Disposition", "attachment; filename=" + filename);
        res.set("Content-Length", fileData.length);
        res.send(fileData);
    };
    var err = function(err) {
        res.status(404).send("Sorry, there was an error when exporting the data: " + err.message);
    };
    issue.findProjectIssues(req.params.prjName, ok, err);
};

// Generate findings issue report for a specific project in HTML format
exports.genPrjIssueFindingsReportHtml = function(req, res) {
    var prjName = req.params.prjName;
    var filename = prjName + "-issues.html";
    var fileData = "";
    var showAllIssues = false;
    var ok = function(records) {
        console.log("Got " + records.length + " issue records for project " + prjName);
        fileData += toHtml(records, prjName, showAllIssues);
        res.set("Content-type", "text/html");
        res.set("Content-Disposition", "attachment; filename=" + filename);
        res.set("Content-Length", fileData.length);
        res.send(fileData);
    };
    var err = function(err) {
        //res.send(404);
        res.status(404).send(
            "Sorry, there was an error when generating the report: " + err.message
        );
    };
    issue.findProjectIssues(req.params.prjName, ok, err);
};

// Generate full issue report for a specific project in HTML format
exports.genPrjIssueFullReportHtml = function(req, res) {
    var prjName = req.params.prjName;
    var filename = prjName + "-issues.html";
    var fileData = "";
    var showAllIssues = true;
    var ok = function(records) {
        console.log("Got " + records.length + " issue records for project " + prjName);
        fileData += toHtml(records, prjName, showAllIssues);
        res.set("Content-type", "text/html");
        res.set("Content-Disposition", "attachment; filename=" + filename);
        res.set("Content-Length", fileData.length);
        res.send(fileData);
    };
    var err = function(err) {
        //res.send(404);
        res.status(404).send(
            "Sorry, there was an error when generating the report: " + err.message
        );
    };
    issue.findProjectIssues(req.params.prjName, ok, err);
};

// Export all Issue data to CSV format
exports.exportIssuesCSV = function(req, res) {
    var filename = "all-issues.csv";
    var fileData = "";
    var ok = function(records) {
        console.log("Got " + records.length + " issue records");
        fileData += toCsv(records);
        res.set("Content-type", "text/csv");
        res.set("Content-Disposition", "attachment; filename=" + filename);
        res.set("Content-Length", fileData.length);
        res.send(fileData);
    };
    var err = function(err) {
        res.status(404).send("Sorry, there was an error when exporting: " + err.message);
    };
    issue.findAll(ok, err);
};

/**
 * Converts a value to a string appropriate for entry into a CSV table (surrounded by quotes).
 * @param {string|number|object} theValue
 * @param {string} sDelimiter The string delimiter.  Defaults to a double quote (") if omitted.
 */
function toCsvValue(theValue, sDelimiter) {
    var t = typeof theValue,
        output;
    if (theValue === null) theValue = "";
    theValue = String(theValue);
    theValue = theValue.replace(/"/g, '""');

    if (typeof sDelimiter === "undefined" || sDelimiter === null) {
        sDelimiter = '"';
    }

    if (t === "undefined" || t === null) {
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
    var i,
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
 * @return {string} The CSV equivalent of objArray.
 */
function toHtml(objArray, prjName, showAllIssues) {
    var obj = {};
    var output = "<html><head>\n";
    var priority = "N/A",
        prevPrio = "",
        prio = -1;
    var cweUriBase = "https://cwe.mitre.org/data/definitions/";
    output += "<style>";
    output +=
        "body{width:1200px;}a{text-decoration:none;}\na:hover{color:purple;}.tdID{width:1100px;max-width:1100px;vertical-align:top;word-wrap:break-word;}.thID{text-align:right;vertical-align:top;width:80px;}th{vertical-align:top;}img{padding:1px;border:1px solid #021a40;}ol{padding-left:25px;}tr:nth-child(even){background:#EAEAEA;}tr:nth-child(odd){background:#F0F0F0;}";
    output +=
        ".HighP{background-color:red;}.MediumP{background-color:orange;}.LowP{background-color:cyan;}.TestedP{background-color:lightgreen;}.FixedP{background-color:lightgreen;}.TODOP{background-color:lightcyan;}.ExcludeP{background-color:lightgray;}.Skip{background-color:#FFFFFF;}tr:nth-child(even){background:#e5e5e5;}tr:nth-child(odd){background:#F5F5F5;}";
    //output += "body {font-family: 'Times New Roman', Georgia, Serif;}h1,h2,h3,h4,h5,h6 {font-family: 'Playfair Display';letter-spacing: 5px;}";
    output += "a,a:hover{text-decoration:none}a{color:#00f}a:hover{font-weight:bold}";
    output += "th,td{padding:5px;}";
    output += "img{max-height:1000px;max-width:1000px;height:auto;width:auto;}";
    output += "pre{white-space: pre-wrap;}";
    output += "</style>";

    // Traverse the array of issue objects
    output += "</head>\n<body>\n";

    // Generate issue summary
    output += "<h2>Issue Summary</h2>";
    output += "<p>Project: " + prjName + "</p>\n";
    output +=
        "<p>The below table contains a summary of the findings that were captured during manual security testing. ";
    output += "   Those findings should be combined with the results from automated scanning.";
    output +=
        "<p>You may click the links in the Issue column to jump to the specific issue details.</p>";
    output += "<table>\n";
    output += "<tr><th>Priority</th><th>Issue</th></tr>"; //<th>Count</th></tr>";
    for (var i = 0; i < objArray.length; i++) {
        obj = objArray[i];
        prevPrio = priority;
        priority = obj.IPriorityText;
        prio = parseInt(obj.IPriority);

        // Decide which priorities to keep in the report
        // Priority values: 0:Info, 1:Low, 2:Medium, 3:High, -1:Tested, -2:Fixed, -3:TODO,  -4:Exclude
        // If all issues logged need to be printed (for compliance reports), only skip the ones marked as "Exclude"
        if (showAllIssues && prio !== undefined && prio < -3) continue;
        // If only real issues (including informational) need to be printed, skip the tester notes (TODO, Tested, Fixed, Exclude)
        if (!showAllIssues && prio !== undefined && prio < 0) continue;

        // Count the number of URIs
        var count = 0;
        if (obj.IURIs !== undefined) count = obj.IURIs.split("\n").length;

        // Print each issue with the issue as the header and the details as part of a table.
        if (priority !== undefined && priority !== "" && priority !== prevPrio)
            output += "<tr><th class='" + priority + "P'>" + priority + "</th>";
        else output += "<tr><th class='" + priority + "P'></th>";
        output +=
            "<td class='" +
            priority +
            "P'><a href='#" +
            htmlEncode(obj.TID, true, 4, false) +
            "'>" +
            obj.TIssueName +
            "</a></td>";
        //output += "<td class='" + priority + "P'>" + count + "</td>";
        output += "</tr>\n";
    }
    output += "</table>\n";

    // Generate detailed issue report
    output += "<h2>Issue Details</h2>";
    output += "<table>\n";
    for (var i = 0; i < objArray.length; i++) {
        obj = objArray[i];
        prevPrio = priority;
        priority = obj.IPriorityText;
        prio = parseInt(obj.IPriority);

        // Decide which priorities to keep in the report
        // Priority values: 0:Info, 1:Low, 2:Medium, 3:High, -1:Tested, -2:Fixed, -3:TODO,  -4:Exclude
        // If all issues logged need to be printed (for compliance reports), only skip the ones marked as "Exclude"
        if (showAllIssues && prio !== undefined && prio < -3) continue;
        // If only real issues (including informational) need to be printed, skip the tester notes (TODO, Tested, Fixed, Exclude)
        if (!showAllIssues && prio !== undefined && prio < 0) continue;

        // Add " (no follow-up needed)" to priority values Tested:-1 and Fixed:-2.
        if (prio == -1 || prio == -2) {
            priority += " (no follow-up needed)";
        }

        // Print each issue with the issue as the header and the details as part of a table.
        output +=
            "<tr><th class='" +
            priority +
            "P'></th><th class='" +
            priority +
            "P' id='" +
            htmlEncode(obj.TID, true, 4, false) +
            "'>" +
            obj.TIssueName +
            "</th></tr>\n";
        if (obj.CweId !== undefined && obj.CweId !== "")
            output +=
                "<tr><th class='thID'>CWE ID: </th><td class='tdID'><a href='" +
                cweUriBase +
                obj.CweId +
                ".html' target='refWin'>" +
                obj.CweId +
                "</a></td></tr>\n";
        if (obj.IURIs !== undefined && obj.IURIs !== "") {
            output += "<tr><th class='thID'>URI(s): </th><td class='tdID'><ol>";
            var uri = obj.IURIs.split("\n");
            for (var j = 0; j < uri.length; j++) {
                if (uri[j].length > 14) {
                    // TODO: sanitize link
                    output +=
                        "<li><a href='" +
                        uri[j] +
                        "'>" +
                        htmlEncode(uri[j], true, 4, false) +
                        "</a></li>\n";
                }
            }
            output += "</ol></td></tr>\n";
        }
        if (obj.TSeverityText !== undefined && obj.TSeverityText !== "" && prio >= 0)
            output +=
                "<tr><th class='thID'>Severity: </th><td class='tdID'>" +
                obj.TSeverityText +
                "</td></tr>\n";
        if (obj.IPriorityText !== undefined && obj.IPriorityText !== "")
            output +=
                "<tr><th class='thID'>Priority: </th><td class='tdID'>" +
                obj.IPriorityText +
                "</td></tr>\n";

        // For now, don't generate outputs for issue background & remediation (let ther reader use the CWE link if needed)

        /*
        if (obj.TIssueBackground !== undefined && obj.TIssueBackground !== "" && prio >= 0)
            output +=
                "<tr><th class='thID'>Background: </th><td class='tdID'>" +
                htmlEncode(obj.TIssueBackground, true, 4, false) +
                "</td></tr>\n";
        if (
            obj.TRemediationBackground !== undefined &&
            obj.TRemediationBackground !== "" &&
            prio >= 0
        )
            output +=
                "<tr><th class='thID'>Mitigation: </th><td class='tdID'>" +
                htmlEncode(obj.TRemediationBackground, true, 4, false) +
                "</td></tr>\n";
         */
        if (obj.TRef1 !== undefined && obj.TRef1 !== "")
            output +=
                "<tr><th class='thID'>Ref. 1: </th><td class='tdID'><a href='" +
                obj.TRef1 +
                "' target='refWin'>" +
                obj.TRef1 +
                "</a></td></tr>\n";
        if (obj.TRef2 !== undefined && obj.TRef2 !== "")
            output +=
                "<tr><th class='thID'>Ref. 2: </th><td class='tdID'><a href='" +
                obj.TRef2 +
                "' target='refWin'>" +
                obj.TRef2 +
                "</a></td></tr>\n";
        if (obj.INotes !== undefined && obj.INotes !== "")
            output +=
                "<tr><th class='thID'>Notes: </th><td class='tdID'>" +
                htmlEncode(obj.INotes, true, 4, true) +
                "</td></tr>\n";
        if (obj.IEvidence !== undefined && obj.IEvidence !== "")
            output +=
                "<tr><th class='thID'>Evidence: </th><td class='tdID'><pre>" +
                htmlEncode(obj.IEvidence, true, 4, false) +
                "</pre></td></tr>\n";
        if (obj.IScreenshots !== undefined && obj.IScreenshots !== "")
            output +=
                "<tr><th class='thID'>Screenshot(s): </th><td class='tdID'>" +
                obj.IScreenshots +
                "</td></tr>\n";
        output += "<tr><td class='Skip'>&nbsp;</td><td class='Skip'>&nbsp;</td></tr>\n";
    }
    output += "</table>\n";
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
var htmlEncode = function(source, display, tabs, linkify) {
    var i, s, ch, peek, line, result, next, endline, push, spaces;

    if (source === undefined) return "";

    // Stash the next character and advance the pointer
    next = function() {
        peek = source.charAt(i);
        i += 1;
    };

    // Start a new "line" of output, to be joined later by <br />
    endline = function() {
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
    push = function() {
        if (ch < " " || ch > "~") {
            line.push("&#" + ch.charCodeAt(0) + ";");
        } else {
            line.push(ch);
        }
    };

    toLink = function() {
        var replacePattern = (replacePattern = /^- (\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim);
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
                            endline();
                            break;
                        case "\n":
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
