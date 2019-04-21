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
    let op = {};
    op["$set"] = issue;

    let url = "/api/issue/" + issue.PrjName + "/" + issue.TID;
    console.info("Sending PUT request to url " + url + " with data " + JSON.stringify(op));

    $.ajax({
        url: url,
        type: "PUT",
        contentType: "application/json",
        data: JSON.stringify(op),
        dataType: "json"
    });
}

// TODO: Save LastTID to Project collection
function restUpdateLastTID(testId, prjName) {
    console.info("Updating LastTID for project " + prjName);

    // Check if issue already exists
    let op = {};
    op["$set"] = {lastTID: testId};

    var data = JSON.stringify(op);

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
        dataType: "json"
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
    op["$set"] = data;

    // Send put request
    let url = "/api/testkb/" + testId;
    console.info("Sending PUT request to url " + url + " with data " + JSON.stringify(op));
    $.ajax({
        url: url,
        type: "PUT",
        contentType: "application/json",
        data: JSON.stringify(op),
        dataType: "json"
    });
}

// Add new entry to TestKB
function restCreateTest(tid) {
    let kvp = {};
    kvp.TID = "EXT-" + tid;
    kvp.TSource = "Extras";
    kvp.TTestName = "";
    kvp.TPhase = "Extras";

    // Send post request
    let url = "/api/testkb";
    console.info("Sending POST request to url " + url + " with data " + JSON.stringify(kvp));
    $.ajax({
        url: url,
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(kvp),
        dataType: "json"
    });

    alert("Inserted a new blank test " + kvp.TID + ".");
}
