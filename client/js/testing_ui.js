//==============================================================================
//                               GLOBALS
//==============================================================================
const thisURL = new URL(window.location);
const gPrjName = thisURL.searchParams.get("name");
const defaultLayout = "landscape";
const gTextAreaRows = 1;
const gTextAreaRowsExpanded = 15;
const gBlankPageImgTag = '<img src="/images/blankpage.png" />';
let gCveRptBase = "https://nvd.nist.gov/products/cpe/search/results?status=FINAL&orderBy=CPEURI&namingFormat=2.3&keyword=";
let gCveRptSuffix = "";
let gCweUriBase = "https://cwe.mitre.org/data/definitions/";
let gTestRefBase = "/static";

// Call the above functions to populate the DOM
if (gPrjName === null) alert("Missing name parameter in URI, please add '?name=<NAME>'.");

//==============================================================================
//                               UI RENDERING
//==============================================================================
//----------------------------------------------
//  PROJECT TEMPLATE
//----------------------------------------------
let uiProject = new ReactiveHbs({
    container: ".project_mount_point",
    template: "#project_template",
    data: {
        name: gPrjName,
        notes: "",
        scope: "",
        scopeQry: "",
        software: "",
        ScopeQuery: "",
        CweUriBase: "",
        CveRptBase: "",
        CveRptSuffix: "",
        TestRefBase: "",
    },
});
uiProject.onRendered(function () {
    console.debug("onRendered: Registering UI event handlers for test runner");

    // Clear test input upon double-clicking it
    $("#testIn").on("dblclick", function () {
        $("#testIn").val("");
    });

    // Update UI when the user changes the test input
    $("#testIn").on("blur", evtTestInputChanged);

    // When a test player button is changed, update the Testing and Generic Issue sections
    $("#btnBack").on("click", evtToPreviousTest);

    // When a test player button is changed, update the Testing and Generic Issue sections
    $("#btnNext").on("click", evtToNextTest);
});

// Populate project UI from DB data
function uiProjectPopulate(name) {
    console.debug(`Getting data for project ${name}`);
    restGetProjectTestingData(name, function (data) {
        if (data !== null) {
            // Update model (combine config data with flattened project data)
            let prjData = _.assign(data, data.prj);
            uiProject.setData(prjData);
        }
    });
}

// Render and populate
uiProject.render();
uiProjectPopulate(gPrjName);

//----------------------------------------------
// CWE DATALIST TEMPLATE
//----------------------------------------------
let uiCWE = new ReactiveHbs({
    container: ".cwes_mount_point",
    template: "#cwes_template",
    data: {
        cwes: [
            {
                // _id: "",
                CweID: 0,
                Name: "",
                Weakness_Abstraction: "",
                Status: "",
                Description_Summary: "",
            },
        ],
    },
});
uiCWE.onRendered(function () {
    console.debug("onRendered: No UI event handler needed for CWE datalist.");
});

// Populate UI from DB
function uiCwePopulate() {
    console.debug(`Getting all CWE data`);
    restGetAllCWEs(function (data) {
        if (data !== null) {
            const cwes = {cwes: data};
            // Update model
            uiCWE.setData(cwes);
        }
    });
}

// Render and populate UI
uiCWE.render();
uiCwePopulate();

//----------------------------------------------
//  TESTKB TEMPLATE
//----------------------------------------------
let uiTest = new ReactiveHbs({
    container: ".testkb_mount_point",
    template: "#testkb_template",
    data: {
        //_id: "",
        TID: "",
        TSource: "",
        TTestName: "",
        TIssueName: "",
        TSeverity: -1,
        TSeverityText: "",
        TTesterSupport: "",
        TIssueBackground: "",
        TRemediationBackground: "",
        TTRef: "",
        TCweID: 0,
        TPCI: false,
        TTop10: false,
        TTop25: false,
        TStdTest: false,
    },
});
uiTest.onRendered(function () {
    console.log("onRendered: Registering UI event handlers for TestKB fields");

    // When the New Test button is pressed, clear the UI and create another test
    $("#kbBtnNew").on("click", evtNewTest);

    // Update UI when the user changes the CWE input
    $("#cweIn").on("blur", evtCweInputChanged);

    // Save Issue when KB data has changed
    $("#updateIssueFromTestBtn").on("click", evtUpdateIssueFromTest);

    // Override Generic Issue data from CWE data
    $("#useCweIssueDataBtn").on("click", evtUseCweIssueData);

    // Refresh Page button
    $("#refreshBtn").on("click", evtRefreshPage);

    // Add TODOs button
    $("#todosBtn").on("click", evtAddTodos);

    // Show remediation and background
    //$("#issueNameRow, #issueBgRow, #remedBgRow").mouseover(() => {
    $("#issueNameRow").dblclick(() => {
        $("#issueBgRow").show();
        $("#remedBgRow").show();
    });
    // $("#cweRow, #issueRefRow, #issueSevRow, #projectNameRow").mouseout(() => {
    $("#issueBgRow, #remedBgRow").dblclick(() => {
        $("#issueBgRow").hide();
        $("#remedBgRow").hide();
    });

    // Reset all textarea heights back to 2 rows
    $("th").click(function () {
        $(":input").attr("rows", 2);
    });

    // Set all textarea heights to 2 rows from the start
    $(":input").attr("rows", 2);

    // Increase the height of textarea during edits
    $("textarea").on("click", function (event) {
        event.target.rows = gTextAreaRowsExpanded;
    });
});
uiTest.events({
    // React to UI changes to text inputs
    "change textarea,input"(e, elm, tpl) {
        // Get UI value that was changed
        let field = elm.getAttribute("field");
        if (field === null) field = elm.id;
        let value = elm.value;
        if (elm.type === "checkbox") value = elm.checked;
        console.debug(`UI change event: ID=${elm.id} TYPE=${elm.type} FIELD=${field} VALUE=${value}`);

        // Use set() to update model and re-render
        uiTest.set(field, value);
    },
    "change select"(e, elm, tpl) {
        let value = Number(elm.value);
        console.debug(`UI change event: ID=${elm.id} TYPE=${elm.type} FIELD=${elm.id} VALUE=${value}`);
        uiTest.set(elm.id, value);

        // If it's a severity value change, adjust the severity text
        if (elm.id === "TSeverity") uiTest.set("TSeverityText", getSevText(Number(value)));
    },
});
uiTest.helpers({
    isSev(sev) {
        if (uiTest.get("TSeverity") == sev) {
            console.debug(`Adjusting severity selector to ${sev}`);
            return true;
        }
        return false;
    },
    TCweUrl() {
        return gCweUriBase + String(uiTest.get("TCweID"));
    },
});

// Populate UI from DB
function uiTestPopulate(testId) {
    console.debug(`Getting data for Test ID ${testId}`);
    restGetTest(testId, function (data) {
        if (data !== null) {
            data.TPCI = Boolean(data.TPCI);
            data.TTop10 = Boolean(data.TTop10);
            data.TTop25 = Boolean(data.TTop25);
            data.TStdTest = Boolean(data.TStdTest);
            if (data.TSeverity === null) {
                data.TSeverityText = "Medium";
                console.warn(`Test ${testId} has a severity value of null, forcing it to ${data.TSeverityText}`);
                data.TSeverity = getSevVal(data.TSeverityText);
            }
            // Update model
            uiTest.setData(data);
        }
    });
}

// Render (skip populate, waiting for UI events)
uiTest.render();

//----------------------------------------------
//  ISSUE DETAILS TEMPLATE
//----------------------------------------------
const emptyIssue = {
    //_id: "",
    PrjName: "",
    TID: "",
    CweId: 0,
    IEvidence: "",
    INotes: "",
    IPriority: 0,
    IPriorityText: "",
    IScreenshots: "",
    IURIs: "",
    TIssueName: "",
};
let uiIssue = new ReactiveHbs({
    container: ".issue_mount_point",
    template: "#issue_template",
    data: Object.assign({}, emptyIssue),
});
uiIssue.helpers({
    isPrio(prio) {
        if (uiIssue.get("IPriority") == prio) {
            console.debug(`Adjusting priority selector to ${prio}`);
            return true;
        }
        return false;
    },
    ICweUrl() {
        return gCweUriBase + String(uiTest.get("CweId"));
    },
});
uiIssue.onRendered(function () {
    console.log("onRendered: Registering UI event handlers for issue details");

    // When Evidence and Notes fields are double-clicked, prefill them with template text.
    $("#IEvidence, #INotes").on("dblclick", evtAddIssueTemplateText);

    // When pasting images in Evidence, add a Base64 representation
    $("#IScreenshots").on("paste", evtPasteScreenshot);

    // Reset all textarea heights back to 2 rows
    $("th").click(function () {
        $(":input").attr("rows", gTextAreaRows);
    });
    // Set all textarea heights to 2 rows from the start
    $(":input").attr("rows", gTextAreaRows);

    // Increase the height of textarea during edits
    $("textarea").on("click", function (event) {
        event.target.rows = 20;
    });
});
uiIssue.events({
    // React to UI changes to text inputs
    "change textarea,input"(e, elm, tpl) {
        // Get UI value that was changed
        let field = elm.getAttribute("field");
        if (field === null) field = elm.id;
        let value = elm.value;
        if (elm.type === "checkbox") value = elm.checked;
        console.debug(`UI text changed in issue details: ID=${elm.id} TYPE=${elm.type} FIELD=${field} VALUE=${value}`);

        // Handle changes to special fields
        switch (field) {
            case "INotes":
                // Parse Burp issue and set multiple fields
                uiParseBurpIssue();
                break;
            case "IEvidence":
                // Parse evidence field to extract URIs
                uri_list = extractURIs(issue.IEvidence, issue.IURIs);
                uiIssue.set("IURIs", uri_list);
                break;
            default:
                // Default processing: just update the modified field
                uiIssue.set(field, value);
        }
        // Update the DB
        updateIssue();
    },
    "change select"(e, elm, tpl) {
        let value = Number(elm.value);
        console.debug(`UI selector changed in issue details: ID=${elm.id} TYPE=${elm.type} FIELD=${elm.id} VALUE=${value}`);
        uiIssue.set(elm.id, value);

        // If it's a priority value change, adjust the priority text
        if (elm.id === "IPriority") uiIssue.set("IPriorityText", getPriorityText(Number(value)));

        // Update DB
        updateIssue();
    },
});

// Populate UI from DB
function uiIssuePopulate(testId, prjName) {
    console.debug(`Getting issue data for Test ID ${testId} in project ${prjName}`);
    restGetIssue(testId, prjName, function (data) {
        if (data && typeof data === "object") {
            // Update model
            uiIssue.setData(Object.assign({}, emptyIssue));
            uiIssue.setData(data);
            uiUpdateScreenshots();
        } else {
            successMessage(`No issue found for Test ID ${testId}`);
            uiIssue.setData(Object.assign({}, emptyIssue));
        }
    });
}

// Render but don't populate UI (wait for UI events)
uiIssue.render();

//----------------------------------------------
//  ISSUE LIST TEMPLATE
//----------------------------------------------
let uiIssueList = new ReactiveHbs({
    container: ".issuelist_mount_point",
    template: "#issuelist_template",
    data: {
        issues: [Object.assign({}, emptyIssue)],
    },
});

uiIssueList.onRendered(function () {
    console.log("onRendered: Registering UI event handlers for issue list");

    // Delete Issue
    $(".delete").on("click", evtDeleteIssue);

    // Show the issue details when clicking in the list
    $(".issueTD").on("click", evtShowIssue);

    // Add blank page icon
    uiUpdateScreenshots();
});
uiIssueList.render();

// Populate UI from DB
function uiIssueListPopulate(name) {
    console.debug(`Getting issue list for project ${name}`);
    restGetIssueList(name, function (data) {
        if (data && data.length) {
            const issues = {issues: data};
            // Update model
            uiIssueList.setData(issues);
        } else successMessage(`No issue in project ${name}`);
    });
}
uiIssueListPopulate(gPrjName);

//==============================================================================
//                                FUNCTIONS
//==============================================================================

// Update issue and issue list
function updateIssue() {
    restUpdateIssue(uiIssue.getData());
    uiIssueListPopulate(gPrjName);
}

// Create template text into finding sections
function evtAddIssueTemplateText(event) {
    console.info("UI add issue template template text event");

    // Fill Evidence field with template text if empty
    if (event.target.id === "IEvidence") {
        let iEvidence = event.target.value;
        if (!iEvidence) {
            console.info("Adding template text to Evidence field");
            iEvidence = "=== REQUEST ===\nPLACEHOLDER\n\n=== RESPONSE ===\nPLACEHOLDER\n\n[KEYWORDS:XssTest,alert]";
            uiIssue.IEvidence = iEvidence;
        }
    }

    // Fill Notes field with template text in Markdown format if empty
    //var iNotes = $("#INotes").val();
    if (event.target.id === "INotes") {
        let iNotes = event.target.value;
        if (!iNotes) {
            console.info("Adding template text to Notes field");
            iNotes = `\
#### Issue Details 
- Summary: ONE_LINER_SUMMARY
- Description: The NAME feature is vulnerable to ISSUETYPE due to REASON. This could result in IMPACT_DESCRIPTION.

#### Priority
The priority was established based on: 
- Defect priority (Critical..Cosmetic)
- Qualitative risk rating: Likelihood:LOW_MED_HIGH, Impact:LOW_MED_HIGH := Risk:LOW_MED_HIGH
- Simplified DREAD risk rating: AVG(Reproducibility=VAL, Exploitability=VAL, DamagePotential=VAL, AffectedUsers=VAL)
- Severity score from CVSS Calculator: [CVSS_SCORE](https://nvd.nist.gov/vuln-metrics/cvss/v3-calculator?vector=AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H&version=3.1) (C:9,H:7,M:4,L>0)
- Using the [Bugcrowd VRT](https://bugcrowd.com/vulnerability-rating-taxonomy): PRIORITY_RATING - VRT_CATEGORY - VULN_NAME - VARIANT_NAME

#### To Reproduce
- Browse to URI
- ACTION1
- ACTION2

Refer to the Evidence section for additional details (if included).

#### Recommendations
- To remediate this issue, REMEDIATION_DETAILS
- To mitigate this issue, MITIGATION_DETAILS
- See also the _Potential Mitigations_ section of CWE (link above).

#### References
- [OWASP Proactive Controls](https://owasp.org/www-project-proactive-controls/)
- [OWASP Cheat Sheets](https://cheatsheetseries.owasp.org)
- [Mitigations for CWE Top 25](https://cwe.mitre.org/top25/mitigations.html)
- [Mitigations for Azure solutions](https://docs.microsoft.com/en-us/azure/security/develop/threat-modeling-tool-mitigations)
- [OTHER_REF](OTHER_URL)
`;
            uiIssue.set("INotes", iNotes);
        }
    }
}

// Show issue data when clicking in the Findings table
function evtCweInputChanged(event) {
    let cweId = event.target.value;
    console.info("CWE input changed. CWE selected: " + cweId);
    uiUpdateCwe(cweId, false);
}

// Delete Issue
function evtDeleteIssue(event) {
    let testId = $(this).attr("tid");
    let action = $(this).attr("action");
    if (action === "delete") {
        console.info("Deleting issue for " + testId);
        restDeleteIssue(gPrjName, testId);
    }
    uiIssueListPopulate(gPrjName);
}

// Go to next test in the list
function evtToNextTest() {
    console.info("To next test event");

    // Get current input value and the index in the datalist
    let testId = $("#testIn").val();
    let i = uiGetDatalistInputIndex(testId);
    testId = $($("#testList").prop("options")).eq(i).val();
    let testCount = $("#testList").prop("options").length;
    if (i >= testCount - 1) i = 0;
    else i++;
    $("#testIn").val($($("#testList").prop("options")).eq(i).val());
    testId = $($("#testList").prop("options")).eq(i).val();
    uiUpdateStatus("At #" + i + ": " + testId);

    // Refresh UI with test KB data
    uiChangeTest(testId);
}

// Go to the previous test in the list
function evtToPreviousTest() {
    console.info("To previous test event");

    // Get current input value and the index in the datalist
    let testId = $("#testIn").val();
    let i = uiGetDatalistInputIndex(testId);
    let testCount = $("#testList").prop("options").length;
    testId = $($("#testList").prop("options")).eq(i).val();

    // Go to previous test. Adjust text in input.
    if (i <= 0) i = testCount - 1;
    else i--;
    $("#testIn").val($($("#testList").prop("options")).eq(i).val());
    testId = $($("#testList").prop("options")).eq(i).val();
    uiUpdateStatus("At #" + i + ": " + testId);

    // Refresh UI with test KB data
    uiChangeTest(testId);
}

// Overwrite issue data from TestKB
function evtUpdateIssueFromTest() {
    console.info("Overwriting issue data from Test KB");
    let issue = uiIssue.getData();
    let testData = uiTest.getData();

    // Get data from UI
    issue.CweId = testData.TCweID;
    issue.TID = testData.TID;
    issue.PrjName = gPrjName;
    issue.TIssueName = testData.TIssueName;
    issue.IPriorityText = getSevText(Number(testData.TSeverity));
    issue.IPriority = getPriorityVal(issue.IPriorityText);
    //issue.TRef1 = testData.TRef1;
    //issue.TRef2 = testData.TRef2;
    //issue.TSeverity = testData.TSeverity;
    //issue.TSeverityText = testData.TSeverityText;

    // Update model and DB
    uiIssue.setData(issue);
    updateIssue();
}

// Create a new test
function evtNewTest() {
    //let tid = new Date().toISOString().split(".")[0].replace(/[-:]/g, "");
    let tid = Date.now().toString();
    console.info("New test event, creating a new empty test", tid);
    restCreateTest(tid);
}

// Show issue data when clicking in the Findings table
function evtShowIssue() {
    let testId = $(this).attr("tid");
    console.info("Show issue event for TID " + testId);
    $("#testIn").val(testId);
    uiTestPopulate(testId);
    uiIssuePopulate(testId, gPrjName);
}

// Fill empty generic issue fields in UI from CWE data
function evtUseCweIssueData() {
    console.info("Overriding generic issue data from CWE data");
    let cweId = $("#cweIn").val();
    uiUpdateCwe(cweId, false);
}

// Refresh Page event
function evtRefreshPage() {
    console.info("Refreshing page content");
    reloadPage();
}

// Add TODOs event
function evtAddTodos() {
    console.info(`Adding TODO items in ${gPrjName}`);
    restAddTodos(gPrjName);
}

// When pasting images in Evidence, add a Base64 representation
function evtPasteScreenshot(event) {
    console.info("UI paste screenshot event");

    // Get clipboard entries and search for images
    let items = (event.clipboardData || event.originalEvent.clipboardData).items;
    for (let index in items) {
        let item = items[index];
        if (item.kind === "file") {
            let blob = item.getAsFile();
            let reader = new FileReader();
            reader.onload = function (event) {
                let dataUrl = event.target.result;
                let imgTag = "<span class='ssCaption'>CAPTION:<br/>\n<img src='" + dataUrl + "' /></span>\n";
                // Append the data URL to the Evidence field.
                let iScreenshots = uiIssue.get("IScreenshots");
                if (!iScreenshots) {
                    iScreenshots = imgTag;
                } else {
                    iScreenshots = imgTag + "<br/><br/>\n\n" + iScreenshots;
                }
                uiIssue.set("IScreenshots", iScreenshots);
                updateIssue();
                uiUpdateScreenshots();
            };
            reader.readAsDataURL(blob);
        }
    }
}

// When the test selector is changed, update the Testing and Generic Issue sections
function evtTestInputChanged() {
    console.debug("Test input change event");

    // Get the testId and the index in the datalist
    let testId = $("#testIn").val();
    let i = uiGetDatalistInputIndex(testId);
    testId = $($("#testList").prop("options")).eq(i).val();
    uiUpdateStatus("At #" + i + ": " + testId);

    // Refresh UI with test KB data
    uiChangeTest(testId);
}

// Change UI when test is changed
function uiChangeTest(testId) {
    console.info("Test selected: " + testId);

    // Update UI
    $("#testIn").val(testId);
    uiTestPopulate(testId);
    uiIssuePopulate(testId, gPrjName);
}

// Clear Issue Information
function uiClearCweFields() {
    console.info("Clearing CWE values");
    $("#cweIn").val("");
    $("#cweref").attr("href", "#");
    $("#cweref").attr("title", "Click here only when CWE ID is not empty");
}

// Clear Issue Information
function uiClearIssueFields() {
    console.info("Clearing Issue fields");
    let empty = "";
    $("#IURIs").val(empty);
    $("#IURIs").attr("title", empty);
    $("#IEvidence").val(empty);
    $("#IEvidence").attr("title", empty);
    $("#IScreenshots").val(empty);
    $("#INotes").val(empty);
    $("#INotes").attr("title", empty);
    $("#IPriority").val(empty);
    $("#IScreenshotsArea").html("");
    $("#IPriority").prop("selectedIndex", 0);
}

// Clear Testing Information
function uiClearTestingFields() {
    console.info("Clearing Testing fields");
    $("#testIn").val("");
    $("#TPhase").html("");
    $("#TSection").html("");
    $("#TTestName").val("");
    $("#TTesterSupport").val("");
    $("#TTRef").val("");
    $("#TTRefA").attr("href", "");
    $("#cweIn").val("");
    $("#TIssueName").val("");
    $("#TIssueBackground").val("");
    $("#TRemediationBackground").val("");
    $("#TSeverity").prop("selectedIndex", 0);
    $("#TRef1").val("");
    $("#TRef1A").attr("href", "");
    $("#TRef2").val("");
    $("#TRef2A").attr("href", "");
    $("#TPCI").prop("checked", false);
    $("#TTop10").prop("checked", false);
    $("#TTop25").prop("checked", false);
    $("#TStdTest").prop("checked", false);
}

// Clear all UI values when changing project
function uiClear() {
    uiClearTestingFields();
    uiClearIssueFields();
    uiClearCweFields();
}

// Find index in DataList from the text in the input
function uiGetDatalistInputIndex(testId) {
    let testCount = $("#testList").prop("options").length;
    let foundAt = testCount;
    for (let i = 0; i < testCount; i++) {
        let listVal = $($("#testList").prop("options")).eq(i).val();
        if (listVal === testId) {
            foundAt = i;
            break;
        }
    }
    return foundAt;
}

// When the issue notes comes from pasting text from the Burp Extender's Clipboarder extension, process it
function uiParseBurpIssue() {
    console.info("Trying to extract Burp Issue data from Notes");

    // Get Issue and TestKB data to overwrite
    let data = uiIssue.getData();
    let testkb = uiTest.getData();

    // If the note is Burp-formatted, perform multi-line processing
    let newNotes = "",
        urlSection = false,
        issueBGSection = false,
        remedBGSection = false,
        notes = $("#INotes").val(),
        lines = notes.split("\n");
    for (let i in lines) {
        // Capture the Issue Name
        let t = lines[i].split(":");
        if (lines[i].startsWith("Issue:")) {
            data.TIssueName = t[1].trim();
        }

        // Convert the severity text to a numeric value
        if (lines[i].startsWith("Severity:")) {
            data.IPriorityText = t[1].trim();
            data.IPriority = getPriorityVal(data.IPriorityText);
        }

        // Capture the URL list
        else if (lines[i].startsWith("URL(s):")) {
            urlSection = true;
        } else if (urlSection) {
            let url = lines[i];
            if (url) {
                url = url.replace(/^ - /, "");
                data.IURIs += url + "\n";
            } else urlSection = false;
        }

        // Capture the Issue Background
        else if (lines[i].startsWith("Issue Background:")) {
            issueBGSection = true;
        } else if (issueBGSection) {
            let ibg = lines[i];
            if (ibg && ibg !== "~") {
                testui.TIssueBackground += ibg + "\n";
            } else issueBGSection = false;
        }

        // Capture the Remediation Background
        else if (lines[i].startsWith("Remediation Background:")) {
            remedBGSection = true;
        } else if (remedBGSection) {
            let rbg = lines[i];
            if (rbg && rbg !== "~") {
                testui.TRemediationBackground += rbg + "\n";
            } else remedBGSection = false;
        }

        // Capture the evidence
        else if (lines[i].startsWith("Evidence:")) {
            data.IEvidence = t[1].trim();
        }

        // Remove the empty lines with "~" from Burp Clipboarder and
        // keep other unmodified lines.
        else {
            newNotes += lines[i].replace(/^~$/, "") + "\n";
        }
    }

    // Post-processing

    // Make sure we have a TID and PrjName
    if (!data.TID || data.TID.length <= 1) {
        data.TID = $("#testIn").val();
    }
    if (!data.PrjName || data.PrjName.length <= 1) {
        data.PrjName = gPrjName;
    }

    // Make sure we have an issue name
    if (data.TIssueName && data.TIssueName.length > 0) {
        data.TIssueName = $("#TIssueName").val();
    }
    // Strip HTML tags from issue and remediation background text
    if (testkb.TIssueBackground) {
        testkb.TIssueBackground = stripHtmlTags(testkb.TIssueBackground).replace(/ +/g, " ").trim();
    }
    if (testkb.TRemediationBackground) {
        testkb.TRemediationBackground = stripHtmlTags(testkb.TRemediationBackground).replace(/ +/g, " ").trim();
    }
    // Convert the Base-64 encoded evidence data
    if (data.IEvidence) {
        // Decode the Base64 value
        data.IEvidence = decodeURIComponent(
            Array.prototype.map
                .call(atob(data.IEvidence), function (c) {
                    return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
                })
                .join("")
        ).trim();
    }

    // Save the note after removing "~", stripping HTML tags and collapsing
    // multiple spaces (from Burp Clipboarder extension).
    if (newNotes.length > 0) {
        newNotes = stripHtmlTags(newNotes).replace(/ +/g, " ").trim();
        data.INotes = newNotes;
    }
    uiIssue.setData(data);
    uiTest.setData(testkb);
    restUpdateTest(testkb.TID, testkb);
}

// Update screenshots from the Images field
function uiUpdateScreenshots() {
    console.info("Updating screenshots area");
    let imgTags = $("#IScreenshots").val();
    if (!imgTags) {
        imgTags = gBlankPageImgTag;
    }
    $("#IScreenshotsArea").html(imgTags);
}

// Update generic issue data in UI from CWE data
function uiUpdateCwe(cweId, forceUpdate) {
    console.info("Updating UI with CWE data");

    let rec = {};
    if (cweId) {
        console.info("Updating UI for CWE-" + cweId);
        restGetCwe(cweId, function (cwe) {
            if (cwe !== null) {
                let uiData = uiTest.getData();
                uiUpdateStatus("Received REST response for CWE ID " + cweId);

                // If the issue name is empty, use the CWE name.
                if (!uiData.TIssueName || uiData.TIssueName.length <= 0 || forceUpdate) {
                    uiData.TIssueName = cwe.Name;
                }

                // If the issue background is empty, use the CWE description.
                if (!uiData.TIssueBackground || uiData.TIssueBackground.length <= 0 || forceUpdate) {
                    let description = cwe.Description_Summary;
                    let extendedDescr = cwe.Extended_Description;
                    if (description.length && extendedDescr) description += "\n\n" + extendedDescr;
                    uiData.TIssueBackground = description;
                }

                // If the issue remediation is empty, use the CWE Potential Mitigations.
                if (!uiData.TRemediationBackground || uiData.TRemediationBackground.length <= 0 || forceUpdate) {
                    let cweMitig = cwe.Potential_Mitigations;
                    if (cweMitig) {
                        cweMitig = cweMitig.replace(/^::PHASE/g, "PHASE");
                        cweMitig = cweMitig.replace(/::PHASE/g, "\n\nPHASE");
                        cweMitig = cweMitig.replace(/:STRATEGY::/g, ":");
                        cweMitig = cweMitig.replace(/:EFFECTIVENESS::/g, ":");
                        cweMitig = cweMitig.replace(/:STRATEGY/g, "\nSTRATEGY");
                        cweMitig = cweMitig.replace(/:EFFECTIVENESS/g, "\nEFFECTIVENESS");
                        cweMitig = cweMitig.replace(/:DESCRIPTION/g, "\nDESCRIPTION");
                        cweMitig = cweMitig.replace(/::/g, "");
                        uiData.TRemediationBackground = cweMitig;
                    }
                }

                // Update test data from UI changes related to changing the CWE
                let testId = $("#testIn").val();
                uiData["TCweID"] = cweId;
                uiTest.setData(uiData);
                restUpdateTest(testId, uiData);
            } else {
                msg = "WARNING: Did not receive REST response for CWE " + cweId;
                warningMessage(msg);
            }
        });
    }
}

// Update status message in UI
function uiUpdateStatus(msg) {
    console.info(`UI status update: ${msg}`);
}

// Reload page (refreshes the displayed test KB entries and issue list)
function reloadPage() {
    location.reload();
}

// If session gets expired, redirect to login page to avoid wasting time (possibly losing more work)
// This code should actually prevent the session expiry due to the request sent.
var xhr = new XMLHttpRequest();
var url = document.location.href;
let sessionCheckInterval = 1 * 60 * 1000; // 1 minute
var refreshCounter = 1;
function checkSession() {
    xhr.open("GET", url, true);
    xhr.onload = function () {
        if (xhr.status === 200) {
            if (xhr.responseURL === url) {
                console.info("checkSession(): Last page refresh", refreshCounter++, "min. ago.");
            } else {
                alert("Session is not active, you will be redirected to the login page.", xhr.responseURL);
                window.location = "/";
            }
        }
    };
    xhr.send();
}

function extractURIs(evidence, uri_list) {
    if (uri_list.length > 0) uri_list = uri_list.trim() + "\n";
    console.debug("Initial URIs: ", uri_list);
    let lines = evidence.split(/\r\n|\r|\n/);
    let url_re = /^====*(http.*)===/;
    for (let line of lines) {
        if (line.match(url_re)) {
            let matched_uri = line.replace(/^=*/, "").replace(/=*$/, "");
            if (!uri_list.includes(matched_uri)) {
                console.debug(`Adding URI '${matched_uri}' to the list`);
                uri_list += matched_uri + "\n";
            } else {
                console.debug(`Matched evidence URI '${matched_uri}' already in URIs`);
            }
        }
    }
    uri_list = uri_list.trim();
    console.debug("Updated URIs: ", uri_list);
    return uri_list;
}

// Set UI layout
function setLayout(newLayout) {
    layout = newLayout;
    let oldLayout = "portrait";
    let oldIssueListLayout = "portraitIssueList";
    let newIssueListLayout = "landscapeIssueList";
    if (newLayout === "portrait") {
        oldLayout = "landscape";
        oldIssueListLayout = "landscapeIssueList";
        newIssueListLayout = "portaitIssueList";
    }

    $("div[id^='Section']").removeClass(oldLayout);
    $("div[id^='Section']").addClass(newLayout);
    $("#SectionIssueList").removeClass(oldIssueListLayout);
    $("#SectionIssueList").addClass(newIssueListLayout);
    localStorage.setItem("layout", layout);
    console.debug(`Saved layout=${layout} to localstorage`);
}

// Adjust screen layout
let layout = thisURL.searchParams.get("layout");
if (layout === "landscape" || layout === "portrait") {
    console.debug(`Using layout from URL parameter: ${layout}`);
} else {
    let storedLayout = localStorage.getItem("layout");
    if (storedLayout && (storedLayout === "landscape" || storedLayout === "portrait")) {
        layout = storedLayout;
        console.debug(`Using saved layout from localstorage: ${layout}`);
    } else {
        layout = defaultLayout;
        console.debug(`Using default layout: ${layout}`);
    }
}
setLayout(layout);

//setInterval(checkSession, sessionCheckInterval);
