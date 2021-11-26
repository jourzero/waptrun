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
        warningMessage(msg);
        return;
    }
    if (prjName === undefined || prjName === "") {
        let msg = "WARNING: Cannot delete issue data: Missing Project Name";
        console.warn(msg);
        warningMessage(msg);
        return;
    }

    // Send REST call for issue data
    let url = "/api/issue/" + prjName + "/" + testId;
    console.debug("Sending DELETE request to " + url);
    return $.ajax({
        url: url,
        type: "DELETE",
    });
}

// Get CWE data for a CWE ID
function restGetCwe(cweId, callback) {
    // Send REST call for CWE data
    let url = "/api/cwe/" + cweId;
    console.debug("Sending GET request to " + url);
    $.get(url, callback).fail(() => {
        msg = "GET request for CWE data failed";
        console.warn(msg);
        warningMessage(msg);
    });
}

// Get account data
function restGetAccount(callback) {
    // Send REST call for account data
    let url = "/api/account";
    console.debug("Sending GET request to " + url);
    $.get(url, callback).fail(() => {
        console.warn("GET request for account data failed");
        warningMessage("GET request for account data failed");
    });
}

// Get all CWE data
function restGetAllCWEs(callback) {
    // Send REST call for all CWE data
    let url = "/api/cwe";
    console.debug("Sending GET request to " + url);
    $.get(url, callback).fail(() => {
        console.warn("GET request for all CWE data failed");
        warningMessage("GET request for all CWE data failed");
    });
}

// Get project data for a specific project
function restGetProject(prjName, callback) {
    // Send REST call for project data
    let url = "/api/project/" + prjName;
    console.debug("Sending GET request to " + url);
    $.get(url, callback).fail(() => {
        console.warn("GET request for project data failed");
        warningMessage("GET request for project data failed");
    });
}

// Get all projects
function restGetProjects(callback) {
    // Send REST call for project data
    let url = "/api/project";
    console.debug("Sending GET request to " + url);
    $.get(url, callback).fail(() => {
        console.warn("GET request for project data failed");
        warningMessage("GET request for project data failed");
    });
}

// Get Issue data for a specific test/project
function restGetIssue(testId, prjName, callback) {
    // Send REST call for issue data
    let url = "/api/issue/" + prjName + "/" + testId;
    console.debug("Sending GET request to " + url);
    $.get(url, callback).fail(() => {
        console.warn("GET request for issue data failed");
        warningMessage("GET request for issue data failed");
    });
}
// Get Issue data for a specific project
function restGetIssueList(prjName, callback) {
    // Send REST call for issue data
    let url = "/api/issue/" + prjName;
    console.debug("Sending GET request to " + url);
    $.get(url, callback).fail(() => {
        console.warn("GET request for project issue data failed");
        warningMessage("GET request for project issue data failed");
    });
}

// Get specific test data from test KB
function restGetTest(testId, callback) {
    // Send REST call for testkb data
    let url = "/api/testkb/" + testId;
    console.debug("Sending GET request to " + url);
    $.get(url, callback).fail(() => {
        console.warn("GET request for testkb data failed");
        warningMessage("GET request for testkb data failed");
    });
}

// Get all test data from test KB
function restGetAllTests(callback) {
    // Send REST call for testkb data
    let url = "/api/testkb";
    console.debug("Sending GET request to " + url);
    $.get(url, callback).fail(() => {
        console.warn("GET request for all testkb data failed");
        warningMessage("GET request for all testkb data failed");
    });
}

// Get testing data for a specific project
function restGetProjectTestingData(prjName, callback) {
    // Send REST call for testing data
    let url = "/api/testing/" + prjName;
    console.debug("Sending GET request to " + url);
    $.get(url, callback).fail(() => {
        console.warn("GET request for project testing data failed");
        warningMessage("GET request for project testing data failed");
    });
}

// Update/insert issue data from UI to the issue collection
function restUpdateIssue(issue) {
    // Check that the UI has the mandatory data we need
    if (issue.TID === undefined || issue.TID === "") {
        let msg = "WARNING: Cannot save issue data: Missing Test ID";
        console.warn(msg);
        warningMessage(msg);
        return;
    }
    if (issue.PrjName === undefined || issue.PrjName === "") {
        let msg = "WARNING: Cannot save issue data: Missing Project Name";
        console.warn(msg);
        warningMessage(msg);
        return;
    }

    let url = "/api/issue/" + issue.PrjName + "/" + issue.TID;
    console.debug("Sending PUT request to url " + url);

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
                console.warn("Could not process the request to update issue.");
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
    /*
    let url = "/api/project/" + prjName;
    console.info("Sending PUT request to url " + url + ": lastTID=" + testId);
    $.ajax({
        url: url,
        type: "PUT",
        contentType: "application/json",
        data: JSON.stringify({lastTID: testId}),
        dataType: "json",
    });
    */
}

/**
 * restCreatePrj
 * @param {string} prjName
 */
function restCreatePrj(prjName) {
    let kvp = {};
    kvp.name = prjName;
    kvp.scope = "DEF";
    kvp.scopeQry = "Default";

    // Send post request
    let url = "/api/project";
    console.debug("Sending POST request to url " + url);
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
                console.warn("Could not process the request to create project.");
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
        warningMessage(msg);
        return;
    }

    // Send REST call for project data
    let url = "/api/project/" + prjName;
    console.debug("Sending DELETE request to " + url);
    return $.ajax({
        url: url,
        type: "DELETE",
        statusCode: {
            200: function () {
                successMessage(`Project deleted successfully. Reloading page...`);
                setTimeout(() => location.reload(), 2000);
            },
            409: function () {
                console.warn("Could not process the request to delete project.");
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
        warningMessage(msg);
        return;
    }

    // Send REST call for issue data
    let url = "/api/issue/" + prjName;
    console.debug("Sending DELETE request to " + url);
    return $.ajax({
        url: url,
        type: "DELETE",
        statusCode: {
            409: function () {
                console.warn("Could not process the request to delete project issues.");
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
    let prjName = prj.name;
    console.debug("Updating project " + prjName);

    let data = JSON.stringify(prj);
    let url = "/api/project/" + prjName;

    console.debug("Sending PUT request to url " + url);
    $.ajax({
        url: url,
        type: "PUT",
        contentType: "application/json",
        data: data,
        dataType: "json",
        statusCode: {
            200: function () {
                successMessage(`Project updated successfully.`);
            },
            422: function (rdata) {
                formatValidationError(rdata);
            },
        },
    });
}

// Update/insert test data to the TestKB collection
function restUpdateTest(testId, data) {
    // Send put request
    let url = "/api/testkb/" + testId;
    console.debug("Sending PUT request to url " + url);
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
                console.warn("Could not process the request to update test.");
                warningMessage("Could not process the request to update test.");
            },
            422: function (rdata) {
                formatValidationError(rdata);
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
    kvp.TTesterSupport = "TODO:Test for ... issue by performing these steps:\n- STEP1\n- STEP2\n- STEP3\n";
    kvp.TCweID = 0;
    kvp.TIssueName = "TODO:Search for CWE and click 'Use CWE Data'.";
    kvp.TIssueBackground = "For background on this issue, please refer to the CWE.";
    kvp.TRemediationBackground = "See 'Potential Mitigations' section of the referenced CWE.";
    kvp.TSeverity = 0;
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
    console.debug("Sending POST request to url " + url);
    $.ajax({
        url: url,
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(kvp),
        dataType: "json",
        statusCode: {
            201: function () {
                successMessage(`Test created successfully: ${kvp.TID}. Reload page to add details to it.`);
            },
            409: function () {
                console.warn("Could not process the request to create a new test.");
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
    console.debug("Sending POST request to url " + url);
    $.ajax({
        url: url,
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({}),
        dataType: "json",
        statusCode: {
            201: function () {
                successMessage(`Project issue TODOs created successfully. Reloading page...`);
                setTimeout(() => location.reload(), 5000);
                //uiIssueListPopulate(gPrjName);
            },
            409: function () {
                console.warn("Could not process the request to create TODO issues.");
                warningMessage("Could not process the request to create TODO issues.");
            },
            422: function (data) {
                formatValidationError(data);
            },
        },
    });
}

/**
 * restSendTestPayload: Send post request
 * @param {string} toolname
 * @param {string} payload
 */
function restRunHackTool(toolname, payload, hackConfig, callback) {
    let url = `/api/hacktool/${toolname}`;
    if (hackConfig !== "") {
        url = `${url}?${hackConfig}`;
    }
    let contentType = "text/plain";
    let dataType = "json";
    console.debug("Sending POST request to url " + url);
    $.ajax({
        url: url,
        type: "POST",
        contentType: contentType,
        data: payload,
        dataType: dataType,
        success: callback,
        statusCode: {
            404: function (data) {
                console.warn(`HTTP 404: Could not process this hack: ${JSON.stringify(data)}`);
                warningMessage(`HTTP 404: Could not process this hack: ${JSON.stringify(data)}`);
            },
            409: function () {
                console.warn(`HTTP 409: Could not process this hack: ${JSON.stringify(data)}`);
                warningMessage(`HTTP 409: Could not process this hack: ${JSON.stringify(data)}`);
            },
            500: function () {
                console.warn(`HTTP 500: Could not process this hack: ${JSON.stringify(data)}`);
                warningMessage(`HTTP 500: Could not process this hack: ${JSON.stringify(data)}`);
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
        if (data.responseText !== undefined && data.responseText.length !== undefined && typeof data.responseText === "string") {
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

/**
 * restBackupDB
 */
function restBackupDB() {
    // Send post request
    let url = "/api/db/backup";
    let data = {};
    console.debug("Sending POST request to url " + url);
    $.ajax({
        url: url,
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(data),
        dataType: "json",
        statusCode: {
            201: function () {
                successMessage(`Backup created successfully. Reloading page...`);
                setTimeout(() => location.reload(), 2000);
            },
            409: function () {
                msg = "Could not process the request to create a backup.";
                console.warn(msg);
                warningMessage(msg);
            },
            422: function (data) {
                formatValidationError(data);
            },
        },
    });
}

$.ajaxSetup({
    statusCode: {
        401: function () {
            window.location.href = "/login";
        },
    },
});
