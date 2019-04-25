/**
 * REST client functions
 */

/**
 * restDeleteIssue
 * @param {string} prjName
 * @param {string} testId
 */
function restDeleteIssue(prjName, testId) {
    // Check that the UI has the mandatory data we need
    if (testId === undefined || testId === "") {
        let msg = "WARNING: Cannot delete issue data: Missing Test ID";
        console.warn(msg);
        uiUpdateStatus("<span class='statusHighlight'>" + msg + "</span>");
        return;
    }
    if (prjName === undefined || prjName === "") {
        let msg = "WARNING: Cannot delete issue data: Missing Project Name";
        console.warn(msg);
        uiUpdateStatus("<span class='statusHighlight'>" + msg + "</span>");
        return;
    }

    // Send REST call for issue data
    let url = "/api/issue/" + prjName + "/" + testId;
    console.info("Sending DELETE request to " + url);
    return $.ajax({
        url: url,
        type: "DELETE"
    });
}

// Get CWE data for a CWE ID
function restGetCwe(cweId, callback) {
    // Send REST call for issue data
    let url = "/api/cwe/" + cweId;
    console.info("Sending GET request to " + url);
    $.get(url, callback);
}

// Get Issue data for a specific test/project

function restGetIssue(testId, prjName, callback) {
    // Send REST call for issue data
    let url = "/api/issue/" + prjName + "/" + testId;
    console.info("Sending GET request to " + url);
    $.get(url, callback);
}

// Get test data from test KB
function restGetTest(testId, callback) {
    let url = "/api/testkb/" + testId;
    console.info("Sending GET request to " + url);
    $.get(url, callback);
}

// Update/insert issue data from UI to the issue collection
function restUpdateIssue(issue) {
    // Check that the UI has the mandatory data we need
    if (issue.TID === undefined || issue.TID === "") {
        let msg = "WARNING: Cannot save issue data: Missing Test ID";
        console.warn(msg);
        uiUpdateStatus("<span class='statusHighlight'>" + msg + "</span>");
        return;
    }
    if (issue.PrjName === undefined || issue.PrjName === "") {
        let msg = "WARNING: Cannot save issue data: Missing Project Name";
        console.warn(msg);
        uiUpdateStatus("<span class='statusHighlight'>" + msg + "</span>");
        return;
    }

    // Check if issue already exists
    //let op = {};
    //op["$set"] = issue;

    let url = "/api/issue/" + issue.PrjName + "/" + issue.TID;
    console.info("Sending PUT request to url " + url + " with data " + JSON.stringify(op));

    $.ajax({
        url: url,
        type: "PUT",
        contentType: "application/json",
        //data: JSON.stringify(op),
        data: JSON.stringify(issue),
        dataType: "json"
    });
}

// TODO: Save LastTID to Project collection
function restUpdateLastTID(testId, prjName) {
    console.info("Updating LastTID for project " + prjName);

    // Check if issue already exists
    //let op = {};
    //op["$set"] = {lastTID: testId};
    //var data = JSON.stringify(op);

    let url = "/api/project/" + prjName;
    console.info("Sending PUT request to url " + url + ": lastTID=" + testId);
    $.ajax({
        url: url,
        type: "PUT",
        contentType: "application/json",
        //data: data,
        data: JSON.stringify({lastTID: testId}),
        dataType: "json"
    });
}

/**
 * restCreatePrj
 * @param {string} prjName
 */
function restCreatePrj(prjName) {
    let kvp = {};
    kvp.name = prjName;
    kvp.scope = "TG4";
    kvp.scopeQry = "OWASP-TG4";

    // Send post request
    let url = "/api/project";
    console.info("Sending POST request to url " + url + " with data " + JSON.stringify(kvp));
    $.ajax({
        url: url,
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(kvp),
        dataType: "json",
        statusCode: {
            201: function() {
                alert("Inserted a new project " + prjName + ".");
                console.info("Reloading the page");
                location.reload();
            },
            409: function() {
                alert("Could not process the request to create a new project");
            },
            422: function() {
                alert("Invalid input data provided when attempting to create a new project.");
            }
        }
    });
}

/**
 * restDeletePrj
 * @param {string} prjName
 */
function restDeletePrj(prjName) {
    if (prjName === undefined || prjName === "") {
        let msg = "WARNING: Cannot delete project data: Missing Project Name";
        console.warn(msg);
        uiUpdateStatus("<span class='statusHighlight'>" + msg + "</span>");
        return;
    }

    // Send REST call for project data
    console.info("Removing project " + prjName);
    let url = "/api/project/" + prjName;
    console.info("Sending DELETE request to " + url);
    return $.ajax({
        url: url,
        type: "DELETE"
    });
}

/**
 * restDeletePrjIssues
 * @param {string} prjName
 */
function restDeletePrjIssues(prjName) {
    if (prjName === undefined || prjName === "") {
        let msg = "WARNING: Cannot delete project data: Missing Project Name";
        console.warn(msg);
        uiUpdateStatus("<span class='statusHighlight'>" + msg + "</span>");
        return;
    }

    // Send REST call for issue data
    console.info("Removing all issues for project " + prjName);
    let url = "/api/issue/" + prjName;
    console.info("Sending DELETE request to " + url);
    return $.ajax({
        url: url,
        type: "DELETE"
    });
}

// Save all values to Project Collection
function restUpdateProject(prj) {
    console.info("Updating project " + prjName);

    let data = JSON.stringify(prj);
    let url = "/api/project/" + prjName;

    console.info("Sending PUT request to url " + url + " with data " + data);
    $.ajax({
        url: url,
        type: "PUT",
        contentType: "application/json",
        data: data,
        dataType: "json"
    });
}

// Update/insert test data to the TestKB collection
function restUpdateTest(testId, data) {
    let op = {};
    //op["$set"] = data;

    // Send put request
    let url = "/api/testkb/" + testId;
    console.info("Sending PUT request to url " + url + " with data " + JSON.stringify(op));
    $.ajax({
        url: url,
        type: "PUT",
        contentType: "application/json",
        //data: JSON.stringify(op),
        data: JSON.stringify(data),
        dataType: "json"
    });
}

// Add new entry to TestKB
function restCreateTest(tid) {
    let kvp = {};
    kvp.TID = "EXT-" + tid;
    kvp.TSource = "Extras";
    kvp.TPhase = "Extras";
    kvp.TSection = "Extras";
    kvp.TTestName = "TODO:RENAME TEST " + tid;
    kvp.TTesterSupport =
        "TODO:Test for ... issue by performing these steps:\n- STEP1\n- STEP2\n- STEP3\n";
    kvp.TCweID = "0";
    kvp.TIssueName = "TODO:Search for CWE and click 'Use CWE Data'.";
    kvp.TIssueBackground = "For background on this issue, please refer to the CWE.";
    kvp.TRemediationBackground = "See 'Potential Mitigations' section of the referenced CWE.";
    kvp.TSeverity = "0";
    kvp.TIssueType = "Extra Test";
    kvp.TPCI = false;
    kvp.TTop10 = false;
    kvp.TTop25 = false;
    kvp.TStdTest = false;
    kvp.TTRef = "https://www.owasp.org/index.php/OWASP_Testing_Guide_v4_Table_of_Contents";
    kvp.TRef1 = "http://cwe.mitre.org/index.html";
    kvp.TRef2 = "https://github.com/OWASP/CheatSheetSeries/blob/master/Index.md";

    // Send post request
    let url = "/api/testkb";
    console.info("Sending POST request to url " + url + " with data " + JSON.stringify(kvp));
    $.ajax({
        url: url,
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(kvp),
        dataType: "json",
        statusCode: {
            201: function() {
                alert("Inserted a new blank test " + kvp.TID + ".");
                console.info("Reloading the page");
                location.reload();
            },
            409: function() {
                alert("Could not process the request to create a new test.");
            },
            422: function() {
                alert("Invalid input data provided when attempting to create a new test.");
            }
        }
    });
}
