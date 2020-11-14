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
        type: "DELETE",
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

    let url = "/api/issue/" + issue.PrjName + "/" + issue.TID;
    console.info("Sending PUT request to url " + url + " with data " + JSON.stringify(issue));

    $.ajax({
        url: url,
        type: "PUT",
        contentType: "application/json",
        data: JSON.stringify(issue),
        dataType: "json",
        statusCode: {
            200: function () {
                successMessage("Issue updated successfully.");
            },
            409: function () {
                warningMessage("Could not process the request to update issue.");
            },
            422: function (data) {
                formatValidationError(data);
            },
        },
    });
}

// TODO: Save LastTID to Project collection
function restUpdateLastTID(testId, prjName) {
    console.info("SKIPPED: Updating LastTID for project " + prjName);
    return;

    let url = "/api/project/" + prjName;
    console.info("Sending PUT request to url " + url + ": lastTID=" + testId);
    $.ajax({
        url: url,
        type: "PUT",
        contentType: "application/json",
        data: JSON.stringify({lastTID: testId}),
        dataType: "json",
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
            201: function () {
                successMessage(`Project created successfully. Reloading page...`);
                setTimeout(() => location.reload(), 2000);
            },
            409: function () {
                warningMessage("Could not process the request to create project.");
            },
            422: function (data) {
                formatValidationError(data);
            },
        },
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
        type: "DELETE",
        statusCode: {
            200: function () {
                successMessage(`Project deleted successfully. Reloading page...`);
                setTimeout(() => location.reload(), 2000);
            },
            409: function () {
                warningMessage("Could not process the request to delete project.");
            },
            422: function (data) {
                formatValidationError(data);
            },
        },
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
        type: "DELETE",
        statusCode: {
            409: function () {
                warningMessage("Could not process the request to delete project issues.");
            },
            422: function (data) {
                formatValidationError(data);
            },
        },
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
        dataType: "json",
        statusCode: {
            422: function (data) {
                formatValidationError(data);
            },
        },
    });
}

// Update/insert test data to the TestKB collection
function restUpdateTest(testId, data) {
    // Send put request
    let url = "/api/testkb/" + testId;
    console.info("Sending PUT request to url " + url + " with data " + JSON.stringify(data));
    $.ajax({
        url: url,
        type: "PUT",
        contentType: "application/json",
        data: JSON.stringify(data),
        dataType: "json",
        statusCode: {
            200: function () {
                successMessage(`Test updated successfully.`);
            },
            409: function () {
                warningMessage("Could not process the request to update test.");
            },
            422: function (data) {
                formatValidationError(data);
            },
        },
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
            201: function () {
                successMessage(
                    `Test created successfully: ${kvp.TID}. Reload page to add details to it.`
                );
            },
            409: function () {
                warningMessage("Could not process the request to create a new test.");
            },
            422: function (data) {
                formatValidationError(data);
            },
        },
    });
}

/**
 * restAddTodos
 * @param {string} prjName
 */
function restAddTodos(prjName) {
    // Send post request
    let url = `/api/issue/${prjName}/todos`;
    console.info("Sending POST request to url " + url);
    $.ajax({
        url: url,
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({}),
        dataType: "json",
        statusCode: {
            201: function () {
                successMessage(`Project issue TODOs created successfully. Reloading page...`);
                setTimeout(() => location.reload(), 2000);
            },
            409: function () {
                warningMessage("Could not process the request to create TODO issues.");
            },
            422: function (data) {
                formatValidationError(data);
            },
        },
    });
}

// Clear status message popup
function clearMsg() {
    $("#msg").html("");
    $("#msg").removeClass("alert-success alert-warning alert-danger ");
}

// Extract validation error and format it nicely for UI output
function formatValidationError(data) {
    let errMsg = "Input Validation Error: ";
    let msg = "";
    if (data !== undefined && data.responseText !== undefined) {
        if (
            data.responseText !== undefined &&
            data.responseText.length !== undefined &&
            typeof data.responseText === "string"
        ) {
            let body = JSON.parse(data.responseText);

            if (body !== undefined && body.errors !== undefined) {
                for (let i in body.errors) {
                    if (msg.length > 0) msg += "<br/>";
                    msg += body.errors[i].param + ": " + body.errors[i].msg;
                }
            }
        }
    }
    errMsg += msg;
    clearMsg();
    $("#msg").addClass("alert alert-danger");
    $("#msg").html(errMsg);
    setTimeout(clearMsg, 8000);
}

// Show success message message
function successMessage(msg) {
    if (msg !== undefined) {
        clearMsg();
        $("#msg").addClass("alert alert-success");
        $("#msg").html(msg);
        setTimeout(clearMsg, 5000);
    }
}

// Show warning message message
function warningMessage(msg) {
    if (msg !== undefined) {
        clearMsg();
        $("#msg").addClass("alert alert-warning");
        $("#msg").html(msg);
        setTimeout(clearMsg, 8000);
    }
}
