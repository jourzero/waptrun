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

//let testCount = $("#testList").prop("options").length;
//let statusMsg = "Loaded " + testCount + " tests";

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
        _id: "",
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
        //prj: { _id: "", name: prjName, notes: "", scope: "", scopeQry: "", software: "", ScopeQuery: JSON.stringify(scopeQuery),
        //      PciTests: false, StdTests: false, Top10Tests: false, Top25Tests: false, TCweIDSearch: "", TTestNameKeyword: "",},
        //tests: [ { _id: "", TID: "", TSource: "", TTestName: "", }, ],
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

    // Show project details on mouseover
    // $(".MouseOverRow").mouseover(() => {
    //     $("#projectDetailsRow").show();
    // });
    // $(".MouseOutRow").mouseout(() => {
    //     $("#projectDetailsRow").hide();
    // });
});
// uiProject.events({
//     // React to UI changes to text inputs
//     "change textarea,input"(e, elm, tpl) {
//         // Get UI value that was changed
//         let field = elm.getAttribute("field");
//         if (field === null) field = elm.id;
//         let value = elm.value;
//         if (elm.type === "checkbox") value = elm.checked;
//         console.debug(`UI change event: ID=${elm.id} TYPE=${elm.type} FIELD=${field} VALUE=${value}`);

//         // Skip set to avoid re-rendering the test runner for no good reason (it also breaks it)
//         //uiProject.set(field, value);
//     },
// });

// Populate project UI from DB data
function uiProjectPopulate(name) {
    console.debug(`Getting data for project ${name}`);
    restGetProjectTestingData(name, function (data) {
        if (data !== null) {
            //successMessage("Project testing data extraction succeeded");
            //console.debug(`prj: ${JSON.stringify(data.prj, null, 4)}`);
            //console.debug(`tests[0]: ${JSON.stringify(data.tests[0], null, 4)}`);

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
                _id: "",
                ID: 0,
                Name: "",
                Weakness_Abstraction: "",
                Status: "",
                Description_Summary: "",
            },
        ],
    },
});
uiCWE.onRendered(function () {
    console.debug("onRendered: Registering UI event handlers for CWE input");
    // Update UI when the user changes the CWE input or double-clicks on the value
    $("#cweIn").on("blur", evtCweInputChanged);
});

// Populate UI from DB
function uiCwePopulate() {
    console.debug(`Getting all CWE data`);
    restGetAllCWEs(function (data) {
        if (data !== null) {
            const cwes = {cwes: data};
            //successMessage("CWE data extraction succeeded");
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
        _id: "",
        TID: "",
        TSource: "",
        TTestName: "",
        TType: "",
        TDescription: "",
        TIssueName: "",
        TIssueType: "",
        TSeverity: -1,
        TSeverityText: "",
        TTesterSupport: "",
        //TPhase: "",
        //TSection: "",
        //TStep: "",
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

    // When the test fields values change, update the Test KB
    /*
    $("#TTestName, #TTesterSupport, #TTRef, #cwename, #cweid, #TIssueName, #TIssueBackground").on("change", evtTestKBDataChanged);
    $("#TRemediationBackground, .testKbCB, #TSeverity, #TRef1, #TRef2").on("change", evtTestKBDataChanged);
    $("#TPCI, #TTop10, #TTop25, #TStdTest").on("change", evtTestKBDataChanged);
    */

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
        //console.debug(`Data before: ${JSON.stringify(uiTest.getData())}`);
        uiTest.set(field, value);
        //console.debug(`Data after: ${JSON.stringify(uiTest.getData())}`);
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
            //successMessage(`Data for Test ID ${testId} was extracted successfully`);
            // Update model
            uiTest.setData(data);
            //$("#TSeverity").val(data.TSeverity);
            /*
            $("#TPCI").prop("checked", data.TPCI);
            $("#TTop10").prop("checked", data.TTop10);
            $("#TTop25").prop("checked", data.TTop25);
            $("#TStdTest").prop("checked", data.TStdTest);
            $("#cweIn").val(data.TCweID);
            $("#cweref").attr("href", gCweUriBase + data.TCweID + ".html");
            */
        }
    });
}

// Render (skip populate, waiting for UI events)
uiTest.render();

//----------------------------------------------
//  ISSUE DETAILS TEMPLATE
//----------------------------------------------
const emptyIssue = {
    _id: "",
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

    // When the Specific Issue Data changes, save it to the Issue collection
    //$("#IURIs, #IEvidence, #IScreenshots, #IPriority").on("change", evtIssueDataChanged);

    // When Evidence and Notes fields are double-clicked, prefill them with template text.
    $("#IEvidence, #INotes").on("dblclick", evtAddIssueTemplateText);

    // When pasting images in Evidence, add a Base64 representation
    $("#IScreenshots").on("paste", evtPasteScreenshot);

    // When the evidence field changes, try to parse it as raw HTTP data that comes from Burp Clipboarder.
    /*
    $("#IEvidence").on("blur", function (event) {
        //let issue = uiGetIssue();
        let issue = uiIssue.getData();
        if (issue !== undefined) {
            //let evidence = $("#IEvidence").val();
            //let uri_list = $("#IURIs").val();
            uri_list = extractURIs(issue.IEvidence, issue.IURIs);
            //$("#IURIs").val(uri_list);
            uiIssue.set("IURIs", uri_list);
        }
    });
    */

    // When the notes field changes, try to parse it as an issue that comes from Burp Clipboarder.
    /*
    $("#INotes").on("blur", function (event) {
        uiParseBurpIssue();
        //let issue = uiGetIssue();
        let issue = uiIssue.getData();
        if (issue !== undefined) restUpdateIssue(issue);
    });
    */

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
        if (data !== null) {
            //successMessage(`Issue for Test ID ${testId} was extracted successfully`);
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
/*
uiIssueList.events({
    // React to UI changes to text inputs
    "change textarea,input"(e, elm, tpl) {
        // Get UI value that was changed
        let field = elm.getAttribute("field");
        if (field === null) field = elm.id;
        let value = elm.value;
        if (elm.type === "checkbox") value = elm.checked;
        console.debug(`UI change event: ID=${elm.id} TYPE=${elm.type} FIELD=${field} VALUE=${value}`);

        // Skip below, the issue list is only used to change the issue details
        // Use set() to update model and re-render
        //uiIssueList.set(field, value);
    },
});
*/
uiIssueList.render();

// Populate UI from DB
function uiIssueListPopulate(name) {
    console.debug(`Getting issue list for project ${name}`);
    restGetIssueList(name, function (data) {
        if (data && data.length) {
            const issues = {issues: data};
            //successMessage("Issue list for project was extracted successfully");
            //console.debug(`Issue list ${JSON.stringify(issues, null, 4)}`);
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
    //var iEvidence = $("#IEvidence").val();
    if (event.target.id === "IEvidence") {
        let iEvidence = event.target.value;
        if (iEvidence === undefined || iEvidence.length === 0) {
            console.info("Adding template text to Evidence field");
            iEvidence = "=== REQUEST ===\nPLACEHOLDER\n\n=== RESPONSE ===\nPLACEHOLDER\n\n[KEYWORDS:XssTest,alert]";
            //$("#IEvidence").val(iEvidence);
            uiIssue.IEvidence = iEvidence;
        }
    }

    // Fill Notes field with template text in Markdown format if empty
    //var iNotes = $("#INotes").val();
    if (event.target.id === "INotes") {
        let iNotes = event.target.value;
        if (iNotes === undefined || iNotes.length === 0) {
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
            let issueData = uiIssue.getData();
            if (issueData.TIssueBackground) {
                iNotes += "\n\n#### CWE Issue Background\n" + issueData.TIssueBackground;
            }
            if (issueData.TRemediationBackground) {
                iNotes += "\n\n#### CWE Remediation\n" + issueData.TRemediationBackground;
            }
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
    //reloadPage("Reloading page to refresh the issue list");
    //alertOnUpdate();
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

/*
// Save issue data in UI to issue collection
function evtIssueDataChanged() {
    console.info("Issue data changed event");
    //issue = uiGetIssue();
    let issue = uiIssue.getData();
    if (issue !== undefined) {
        restUpdateIssue(issue);

        // Update titles so that mouse-over information matches the content
        //$("#IURIs").attr("title", issue.IURIs);
        //$("#IEvidence").attr("title", issue.IEvidence);
        //$("#INotes").attr("title", issue.INotes);
    }
    uiUpdateScreenshots();
    alertOnUpdate();
}
*/

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
    //uiUpdateFromTestKB(testId);
    //uiClearTestingFields();
    $("#testIn").val(testId);
    uiTestPopulate(testId);
    //uiUpdateFromIssueColl(testId);
    //uiClearIssueFields();
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
                //let iScreenshots = $("#IScreenshots").val();
                let iScreenshots = uiIssue.get("IScreenshots");
                if (iScreenshots === undefined || iScreenshots.length === 0) {
                    iScreenshots = imgTag;
                } else {
                    iScreenshots = imgTag + "<br/><br/>\n\n" + iScreenshots;
                }
                //$("#IScreenshots").val(iScreenshots);
                uiIssue.set("IScreenshots", iScreenshots);
                //issue = uiGetIssue();
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

// Update TestDB from UI data
function evtTestKBDataChanged(event) {
    let field = event.target.id;
    let value = event.target.value;
    let testId = $("#testIn").val();

    // Tweak the new value if it comes from one of the checkboxes
    if (field === "TPCI" || field === "TTop10" || field === "TTop25" || field === "TStdTest") value = $("#" + field).prop("checked");

    // Update the DB
    console.warn("TODO: check refactoring in evtTestKBDataChanged");
    console.info("Updating Test " + testId + " with " + field + "=" + value);
    let data = {};
    data[field] = value;
    restUpdateTest(testId, data);
    //uiTest.set(field, value);
}

// Change UI when test is changed
function uiChangeTest(testId) {
    console.info("Test selected: " + testId);

    // Update UI
    console.warn("TODO: check refactoring in uiChangeTest");
    //uiUpdateFromTestKB(testId);
    //uiClearTestingFields();
    $("#testIn").val(testId);
    uiTestPopulate(testId);
    //uiUpdateFromIssueColl(testId);
    //uiClearIssueFields();
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
    //$("#TType").val("");
    $("#TTesterSupport").val("");
    //$("#TTesterSupport").attr("title", "");
    //$("#TDescr").val("");
    $("#TTRef").val("");
    $("#TTRefA").attr("href", "");
    //$("#TTRef2").val("");
    //$("#TTRef2A").attr('href', "");
    $("#cweIn").val("");
    $("#TIssueName").val("");
    $("#TIssueBackground").val("");
    $("#TRemediationBackground").val("");
    $("#TIssueType").val("");
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

// Get issue data from the UI
/* NOT NEEDED ANYMORE
function uiGetIssue() {
    let issue = {};
    issue.CweId = $("#cweIn").val();
    issue.TID = $("#testIn").val();
    issue.TIssueName = $("#TIssueName").val();
    issue.TIssueBackground = $("#TIssueBackground").val();
    issue.TRemediationBackground = $("#TRemediationBackground").val();
    issue.TSeverity = Number($("#TSeverity").val());
    issue.TRef1 = $("#TRef1").val();
    issue.TRef2 = $("#TRef2").val();
    issue.TSeverityText = $("#TSeverity option:selected").text();
    issue.IURIs = $("#IURIs").val();
    issue.IEvidence = $("#IEvidence").val();
    issue.IScreenshots = $("#IScreenshots").val();
    issue.IPriority = Number($("#IPriority").val());
    issue.IPriorityText = $("#IPriority option:selected").text();
    issue.INotes = $("#INotes").val();
    issue.PrjName = prjName;
    return issue;
}
*/

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
            //data.TSeverityText = t[1].trim();
            //data.TSeverity = getSevVal(data.TSeverityText);
            data.IPriorityText = t[1].trim();
            data.IPriority = getPriorityVal(data.IPriorityText);
        }

        // Capture the URL list
        else if (lines[i].startsWith("URL(s):")) {
            urlSection = true;
        } else if (urlSection) {
            let url = lines[i];
            if (url !== undefined && url.length > 0) {
                url = url.replace(/^ - /, "");
                data.IURIs += url + "\n";
            } else urlSection = false;
        }

        // Capture the Issue Background
        else if (lines[i].startsWith("Issue Background:")) {
            issueBGSection = true;
        } else if (issueBGSection) {
            let ibg = lines[i];
            if (ibg !== undefined && ibg !== "~") {
                testui.TIssueBackground += ibg + "\n";
            } else issueBGSection = false;
        }

        // Capture the Remediation Background
        else if (lines[i].startsWith("Remediation Background:")) {
            remedBGSection = true;
        } else if (remedBGSection) {
            let rbg = lines[i];
            if (rbg !== undefined && rbg !== "~") {
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
    if (data.TIssueName !== undefined && data.TIssueName.length > 0) {
        data.TIssueName = $("#TIssueName").val();
    }
    // Strip HTML tags from issue and remediation background text
    if (testkb.TIssueBackground !== undefined && testkb.TIssueBackground.length > 0) {
        testkb.TIssueBackground = stripHtmlTags(testkb.TIssueBackground).replace(/ +/g, " ").trim();
        //$("#TIssueBackground").val(issueBG);
        //$("#TIssueBackground").attr("title", issueBG);
    }
    if (testkb.TRemediationBackground !== undefined && testkb.TRemediationBackground.length > 0) {
        testkb.TRemediationBackground = stripHtmlTags(testkb.TRemediationBackground).replace(/ +/g, " ").trim();
        //$("#TRemediationBackground").val(remedBG);
        //$("#TRemediationBackground").attr("title", remedBG);
    }
    // Convert the Base-64 encoded evidence data
    if (data.IEvidence !== undefined && data.IEvidence.length > 0) {
        // Decode the Base64 value
        data.IEvidence = decodeURIComponent(
            Array.prototype.map
                .call(atob(data.IEvidence), function (c) {
                    return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
                })
                .join("")
        ).trim();
        //$("#IEvidence").val(evidence);
        //$("#IEvidence").attr("title", evidence);
    }

    // Save the note after removing "~", stripping HTML tags and collapsing
    // multiple spaces (from Burp Clipboarder extension).
    if (newNotes.length > 0) {
        newNotes = stripHtmlTags(newNotes).replace(/ +/g, " ").trim();
        //$("#INotes").val(newNotes);
        //$("#INotes").attr("title", newNotes);
        data.INotes = newNotes;
    }
    console.warn("TODO: check refactoring of uiParseBurpIssue");
    uiIssue.setData(data);
    uiTest.setData(testkb);
    restUpdateTest(testkb.TID, testkb);
}

// Update screenshots from the Images field
function uiUpdateScreenshots() {
    console.info("Updating screenshots area");
    let imgTags = $("#IScreenshots").val();
    if (imgTags === null || imgTags === undefined || imgTags === "") {
        imgTags = gBlankPageImgTag;
    }
    $("#IScreenshotsArea").html(imgTags);
}

// Update generic issue data in UI from CWE data
function uiUpdateCwe(cweId, forceUpdate) {
    console.info("Updating UI with CWE data");

    let rec = {};
    if (cweId !== undefined && cweId !== "") {
        console.info("Updating UI for CWE-" + cweId);
        restGetCwe(cweId, function (cwe) {
            if (cwe !== null) {
                let uiData = uiTest.getData();
                uiUpdateStatus("Received REST response for CWE ID " + cweId);

                // If the issue name is empty, use the CWE name.
                //let issueName = $("#TIssueName").val();
                if (!uiData.TIssueName || uiData.TIssueName.length <= 0 || forceUpdate) {
                    //$("#TIssueName").val(cwe.Name);
                    uiData.TIssueName = cwe.Name;
                }

                // If the issue background is empty, use the CWE description.
                //let issueBG = $("#TIssueBackground").val();
                if (!uiData.TIssueBackground || uiData.TIssueBackground.length <= 0 || forceUpdate) {
                    let description = cwe.Description_Summary;
                    let extendedDescr = cwe.Extended_Description;
                    if (description.length && extendedDescr) description += "\n\n" + extendedDescr;
                    //$("#TIssueBackground").val(description);
                    uiData.TIssueBackground = description;
                }

                // If the issue remediation is empty, use the CWE Potential Mitigations.
                //let issueRemediation = $("#TRemediationBackground").val();
                if (!uiData.TRemediationBackground || uiData.TRemediationBackground.length <= 0 || forceUpdate) {
                    let cweMitig = cwe.Potential_Mitigations;
                    if (cweMitig !== undefined) {
                        cweMitig = cweMitig.replace(/^::PHASE/g, "PHASE");
                        cweMitig = cweMitig.replace(/::PHASE/g, "\n\nPHASE");
                        cweMitig = cweMitig.replace(/:STRATEGY::/g, ":");
                        cweMitig = cweMitig.replace(/:EFFECTIVENESS::/g, ":");
                        cweMitig = cweMitig.replace(/:STRATEGY/g, "\nSTRATEGY");
                        cweMitig = cweMitig.replace(/:EFFECTIVENESS/g, "\nEFFECTIVENESS");
                        cweMitig = cweMitig.replace(/:DESCRIPTION/g, "\nDESCRIPTION");
                        cweMitig = cweMitig.replace(/::/g, "");
                        //$("#TRemediationBackground").val(cweMitig);
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
    /*
    else {
        uiClearCweFields();
    }
    */
}

/* NOT NEEDED ANYMORE (kept for future tweaks)
// Update all UI fields from the Test KB
function uiUpdateFromTestKB(testId) {
    console.info("Updating UI with test KB data");

    // Clear testDB fields before updating them because some UI updates fail due to missing value in DB.
    uiClearTestingFields();
    $("#testIn").val(testId);

    // TODO: refactor below
    console.warn("Not refactored yet!");
    restGetTest(testId, function (rec) {
        if (rec !== null) {
            //uiUpdateStatus("Received REST response for Test ID " + testId);
            $("#TPhase").html(rec.TPhase);
            $("#TSection").html(rec.TSection);
            $("#TTestName").val(rec.TTestName);
            //$("#TTestName").attr("title", rec.TTesterSupport);
            $("#TTesterSupport").val(rec.TTesterSupport);
            //$("#TTesterSupport").attr("title", rec.TTesterSupport);
            $("#TTRef").val(rec.TTRef);
            let testRef = rec.TTRef;
            if (testRef !== undefined && !testRef.startsWith("http")) testRef = gTestRefBase + "/" + testRef;
            $("#TTRefA").attr("href", testRef);

            //$("#TTRef2").val(rec.TTRef2);
            //let testRef2 = rec.TTRef2;
            //if ((testRef2 !== undefined)&&(!testRef2.startsWith("http")))
            //    testRef2 = gTestRefBase + testRef2;
            //$("#TTRef2A").attr('href', testRef2);

            if (rec.TCweID !== undefined) {
                $("#cweIn").val(rec.TCweID);
                $("#cweref").attr("href", gCweUriBase + rec.TCweID + ".html");
                $("#cweref").attr("title", "Click here to view more details for CWE-" + rec.TCweID);
            } else {
                uiClearCweFields();
            }

            $("#TIssueName").val(rec.TIssueName);
            //$("#TIssueName").attr("title", rec.TIssueName);
            $("#TIssueBackground").val(rec.TIssueBackground);
            //$("#TIssueBackground").attr("title", rec.TIssueBackground);
            $("#TRemediationBackground").val(rec.TRemediationBackground);
            //$("#TRemediationBackground").attr("title", rec.TRemediationBackground);
            $("#TSeverity").val(rec.TSeverity);
            $("#TIssueType").val(rec.TIssueType);

            $("#TPCI").prop("checked", rec.TPCI);
            $("#TTop10").prop("checked", rec.TTop10);
            $("#TTop25").prop("checked", rec.TTop25);
            $("#TStdTest").prop("checked", rec.TStdTest);

            $("#TRef1").val(rec.TRef1);
            $("#TRef1A").attr("href", rec.TRef1);
            $("#TRef2").val(rec.TRef2);
            $("#TRef2A").attr("href", rec.TRef2);

            //$("#TType").val(rec.TType);
            //$("#TDescr").val(rec.TDescr);
        } else {
            let msg = "WARNING: Cannot update UI from TestKB. Record not found for testId '" + testId + "'.";
            console.warn(msg);
            uiUpdateStatus("<span class='statusHighlight'>" + msg + "</span>");
        }
    });
}
*/

/* NOT NEEDED ANYMORE (kept for future tweaks)
// Get Test KB data from UI
function uiGetTestKB() {
    let test = {};

    test.TID = $("#testIn").val();
    test.TPhase = $("#TPhase").html();
    test.TSection = $("#TSection").html();
    test.TTestName = $("#TTestName").val();
    test.TTesterSupport = $("#TTesterSupport").val();
    test.TTRef = $("#TTRef").val();

    test.TCweID = $("#cweIn").val();
    test.TIssueName = $("#TIssueName").val();
    test.TIssueBackground = $("#TIssueBackground").val();
    test.TRemediationBackground = $("#TRemediationBackground").val();
    test.TSeverity = $("#TSeverity").val();
    test.TIssueType = $("#TIssueType").val();
    test.TType = $("#TType").val();
    test.TPCI = $("#TPCI").prop("checked");
    test.TTop10 = $("#TTop10").prop("checked");
    test.TTop25 = $("#TTop25").prop("checked");
    test.TStdTest = $("#TStdTest").prop("checked");
    //test.TDescr                 = $("#TDescr").val();
    //test.TTRef2                 = $("#TTRef2").val();
    test.TRef1 = $("#TRef1").val();
    test.TRef2 = $("#TRef2").val();
    return test;
}
*/

/* NOT NEEDED ANYMORE 
// Update all UI fields from the Issue Collection
function uiUpdateFromIssueColl(testID) {
    console.info("Updating UI with issue data");

    // Clear issue fields prior to populating them
    uiClearIssueFields();

    if (testID === undefined || testID === "") {
        console.info("Empty Test ID");
        return;
    }

    // TODO: refactor below
    console.warn("Not refactored yet!");
    restGetIssue(testID, prjName, function (i) {
        if (i !== null) {
            //uiUpdateStatus("Received REST response for issue with Test ID " + testID);
            // Update UI values
            $("#IURIs").val(i.IURIs);
            //$("#IURIs").attr("title", i.IURIs);
            $("#IEvidence").val(i.IEvidence);
            //$("#IEvidence").attr("title", i.IEvidence);
            $("#IScreenshots").val(i.IScreenshots);
            $("#INotes").val(i.INotes);
            //$("#INotes").attr("title", i.INotes);
            $("#IPriority").val(i.IPriority);
            uiUpdateScreenshots();
        } else {
            let msg = "NOTE: Could not find an issue for Test ID " + testID + " in project " + prjName;
            console.info(msg);
            uiUpdateStatus(msg);
        }
    });
}
*/

// Update status message in UI
function uiUpdateStatus(msg) {
    //$("#StatusMsg").html(msg);
    console.info(`UI status update: ${msg}`);
}

/*
// Update the CVE links in the UI
function getSoftwareLinks(software) {
    var swList = software.trim().split(",");
    var swLinksHtml = "";
    for (i = 0; i < swList.length; i++) {
        swLinksHtml += "<a class='smallLink' href='" + cveRptBase + swList[i].trim() + cveRptSuffix + "'target='cveRptUI'>" + swList[i].trim() + "</a>&nbsp;&nbsp;";
    }
    $("#PrjSoftware").html(swLinksHtml);
}
*/

// Reload page (refreshes the displayed test KB entries and issue list)
function reloadPage() {
    location.reload();
}

/*
// Inform user about the need to refresh the page after updates
function alertOnUpdate() {
    successMessage("Press Refresh Page button as needed");
}
*/

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

function testUI() {
    let uiProjectData = {
        prj: {
            _id: "__id_",
            name: "_name_",
            TTestNameKeyword: "_TTestNameKeyword_",
            scope: "_scope_",
            scopeQry: "_scopeQry_",
            PciTests: true,
            StdTests: true,
            Top10Tests: true,
            Top25Tests: true,
            notes: "_notes_",
            software: "_software_",
            TCweIDSearch: "_TCweIDSearch_",
        },
        tests: [
            {
                _id: "__id_",
                TID: "_TID_",
                TSource: "_TSource_",
                TTestName: "_TTestName_",
            },
        ],
    };
    uiProject.setData(uiProjectData);

    let uiCweData = {
        cwes: [
            {
                _id: "__id_",
                ID: 0,
                Name: "_Name_",
                Weakness_Abstraction: "_Weakness_Abstraction_",
                Status: "_Status_",
                Description_Summary: "_Description_Summary_",
            },
        ],
    };
    uiCWE.setData(uiCweData);

    let uiTestData = {
        _id: "__id_",
        TID: "_TID_",
        TSource: "_TSource_",
        TTestName: "_TTestName_",
        TType: "_TType_",
        TDescription: "_TDescription_",
        TIssueType: "_TIssueType_",
        TSeverity: 1,
        TTesterSupport: "_TTesterSupport_",
        TPhase: "_TPhase_",
        TSection: "_TSection_",
        TStep: "_TStep_",
        TTRef: "_TTRef_",
        TCweID: 1,
        TPCI: true,
        TTop10: true,
        TTop25: true,
        TStdTest: true,
        PrjName: "_PrjName_",
        INotes: "_INotes_",
        TIssueName: "_TIssueName_",
    };
    uiTest.setData(uiTestData);

    let uiIssueData = {
        _id: "__id_",
        PrjName: "_PrjName_",
        TID: "_TID_",
        CweId: 1,
        IEvidence: "_IEvidence_",
        INotes: "_INotes_",
        IPriority: 6,
        IPriorityText: "TODO",
        IScreenshots: "_IScreenshots_",
        IURIs: "_IURIs_",
        TIssueName: "_TIssueName_",
    };
    uiIssue.setData(uiIssueData);

    let uiIssueListData = {
        issues: [
            {
                _id: "__id_",
                TID: "_TID_",
                TIssueType: "_TIssueType_",
                TPCI: true,
                PrjName: "_PrjName_",
                CweId: 1,
                IPriority: 6,
                IPriorityText: "TODO",
                INotes: "_INotes_",
                TIssueName: "_TIssueName_",
            },
        ],
    };
    uiIssueList.setData(uiIssueListData);
}

// Adjust screen layout
let layout = thisURL.searchParams.get("layout");
if (layout === "landscape" || layout === "portrait") {
    console.debug(`Using layout from URL parameter: ${layout}`);
} else {
    let storedLayout = localStorage.getItem("layout");
    if (storedLayout !== undefined && (storedLayout === "landscape" || storedLayout === "portrait")) {
        layout = storedLayout;
        console.debug(`Using saved layout from localstorage: ${layout}`);
    } else {
        layout = defaultLayout;
        console.debug(`Using default layout: ${layout}`);
    }
}
setLayout(layout);

//setInterval(checkSession, sessionCheckInterval);
