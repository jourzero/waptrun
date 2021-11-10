//==============================================================================
//                               UI EVENTS
//==============================================================================
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

// Update UI when the user changes the CWE input or double-clicks on the value
$("#cweIn").on("blur", evtCweInputChanged);

// When the New Test button is pressed, clear the UI and create another test
$("#kbBtnNew").on("click", evtNewTest);

// When the test fields values change, update the Test KB
$("#TTestName, #TTesterSupport, #TTRef, #cwename, #cweid, #TIssueName, #TIssueBackground").on(
    "change",
    evtTestKBDataChanged
);
$("#TRemediationBackground, .testKbCB, #TSeverity, #TRef1, #TRef2").on(
    "change",
    evtTestKBDataChanged
);
$("#TPCI, #TTop10, #TTop25, #TStdTest").on("change", evtTestKBDataChanged);

// When the Specific Issue Data changes, save it to the Issue collection
$("#IURIs, #IEvidence, #IScreenshots, #IPriority").on("change", evtIssueDataChanged);

// When Evidence and Notes fields are double-clicked, prefill them with template text.
$("#IEvidence, #INotes").on("dblclick", evtAddIssueTemplateText);

// When pasting images in Evidence, add a Base64 representation
$("#IScreenshots").on("paste", evtPasteScreenshot);

// Delete Issue
$(".delete").on("click", evtDeleteIssue);

// Show the issue details when clicking in the list
$(".issueTD").on("click", evtShowIssue);

// When the evidence field changes, try to parse it as raw HTTP data that comes from Burp Clipboarder.
$("#IEvidence").on("blur", function (event) {
    let issue = uiGetIssue();
    if (issue !== undefined) {
        let evidence = $("#IEvidence").val();
        let uri_list = $("#IURIs").val();
        uri_list = extractURIs(evidence, uri_list);
        $("#IURIs").val(uri_list);
        restUpdateIssue(issue);
    }
});

// When the notes field changes, try to parse it as an issue that comes from Burp Clipboarder.
$("#INotes").on("blur", function (event) {
    uiParseBurpIssue();
    //$("#" + event.target.id).height(20);
    let issue = uiGetIssue();
    if (issue !== undefined) restUpdateIssue(issue);
});

// Save Issue when KB data has changed
$("#updateIssueListBtn").on("click", evtIssueDataChanged);

// Override Generic Issue data from CWE data
$("#useCweIssueDataBtn").on("click", evtUseCweIssueData);

// Refresh Page button
$("#refreshBtn").on("click", evtRefreshPage);

// TODOs button
$("#todosBtn").on("click", evtAddTodos);

//==============================================================================
//                               UI TWEAK EVENTS
//==============================================================================
$(".issueTH").click(function () {
    console.log("Clicked one of the issueTH fields, collapsing all text fields.");
    $("#TTesterSupport").height(20);
    $("#TIssueBackground").height(20);
    $("#TRemediationBackground").height(20);
    $("#IURIs").height(20);
    $("#IEvidence").height(20);
    $("#IScreenshots").height(20);
    $("#INotes").height(20);
});

// When some fields are clicked, increase the text box size
$(
    "#IURIs, #IEvidence, #IScreenshots, #INotes, #TTesterSupport, #TIssueBackground, #TRemediationBackground"
).on("click", function (event) {
    $("#" + event.target.id).height(500);
});

//==============================================================================
//                                FUNCTIONS
//==============================================================================
//
// Create template text into finding sections
function evtAddIssueTemplateText(event) {
    console.info("UI add issue template template text event");

    // Fill Evidence field with template text if empty
    //var iEvidence = $("#IEvidence").val();
    if (event.target.id === "IEvidence") {
        let iEvidence = event.target.value;
        if (iEvidence === undefined || iEvidence.length === 0) {
            console.info("Adding template text to Evidence field");
            iEvidence =
                "=== REQUEST ===\nPLACEHOLDER\n\n=== RESPONSE ===\nPLACEHOLDER\n\n[KEYWORDS:XssTest,alert]";
            $("#IEvidence").val(iEvidence);
            //$("#IEvidence").attr("title", iEvidence);
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
            $("#INotes").val(iNotes);
            //$("#INotes").attr("title", iNotes);
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
        restDeleteIssue(prjName, testId);
    }
    //reloadPage("Reloading page to refresh the issue list");
    alertOnUpdate();
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

// Save issue data in UI to issue collection
function evtIssueDataChanged() {
    console.info("Issue data changed event");
    //let attrib = event.target.id;
    //let value  = event.target.value;
    issue = uiGetIssue();
    if (issue !== undefined) {
        restUpdateIssue(issue);

        // Update titles so that mouse-over information matches the content
        //$("#IURIs").attr("title", issue.IURIs);
        //$("#IEvidence").attr("title", issue.IEvidence);
        //$("#INotes").attr("title", issue.INotes);
    }
    uiUpdateScreenshots();
    //reloadPage("Reloading page to refresh the issue list");
    alertOnUpdate();
}

// Create a new test
function evtNewTest() {
    let tid = new Date().toISOString().split(".")[0].replace(/[-:]/g, "");
    console.info("New test event, creating a new empty test", tid);
    restCreateTest(tid);
}

// Show issue data when clicking in the Findings table
function evtShowIssue() {
    let testId = $(this).attr("tid");
    console.info("Show issue event for TID " + testId);
    uiUpdateFromTestKB(testId);
    uiUpdateFromIssueColl(testId);
}

// Save issue data in UI to issue collection
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
    //let scopeQuery = $("#ScopeQuery").html();
    //console.info(`Adding TODO items in ${prjName} with scope: ${scopeQuery}`);
    console.info(`Adding TODO items in ${prjName}`);
    restAddTodos(prjName);
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
                let imgTag =
                    "<span class='ssCaption'>CAPTION:<br/>\n<img src='" + dataUrl + "' /></span>\n";
                // Append the data URL to the Evidence field.
                let iScreenshots = $("#IScreenshots").val();
                if (iScreenshots === undefined || iScreenshots.length === 0) {
                    iScreenshots = imgTag;
                } else {
                    iScreenshots = imgTag + "<br/><br/>\n\n" + iScreenshots;
                }
                $("#IScreenshots").val(iScreenshots);
                issue = uiGetIssue();
                if (issue !== undefined) restUpdateIssue(issue);
                uiUpdateScreenshots();
            };
            reader.readAsDataURL(blob);
        }
    }
}

// When the test selector is changed, update the Testing and Generic Issue sections
function evtTestInputChanged() {
    console.info("Test input change event");

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
    if (field === "TPCI" || field === "TTop10" || field === "TTop25" || field === "TStdTest")
        value = $("#" + field).prop("checked");

    console.info("Updating Test " + testId + " with " + field + "=" + value);

    // Update the DB
    let data = {};
    data[field] = value;
    restUpdateTest(testId, data);
}

// Change UI when test is changed
function uiChangeTest(testId) {
    console.info("Test selected: " + testId);

    // Update UI
    uiUpdateFromTestKB(testId);
    uiUpdateFromIssueColl(testId);

    // Update LastTID
    //$("#LastTID").html(testId);
    //restUpdateLastTID(testId, prjName);
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
    var empty = "";
    $("#IURIs").val(empty);
    //$("#IURIs").attr("title", empty);
    $("#IEvidence").val(empty);
    //$("#IEvidence").attr("title", empty);
    $("#IScreenshots").val(empty);
    $("#INotes").val(empty);
    //$("#INotes").attr("title", empty);
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

// When the Specific Issue Data changes, parse it if it's formatted as a Burp issue)
// and save the results to the DB.
function uiParseBurpIssue() {
    console.info("Parsing Burp Issue data");

    // If the note is Burp-formatted, parse it
    let notes = $("#INotes").val();
    let lines = notes.split("\n");
    let issueName = "",
        evidence = "",
        urls = "",
        newNotes = "",
        sev = -1,
        sevText = "",
        issueBG = "",
        remedBG = "";
    let urlSection = false;
    let remedBGSection = false;
    let issueBGSection = false;
    for (let i in lines) {
        let t = lines[i].split(":");

        // Capture the Issue Name
        if (lines[i].startsWith("Issue:")) {
            issueName = t[1].trim();
        }

        // Capture the Issue Name
        if (lines[i].startsWith("Severity:")) {
            sevText = t[1].trim();
            sev = getSevVal(sevText);
        }

        // Capture the URL list
        else if (lines[i].startsWith("URL(s):")) {
            urlSection = true;
        } else if (urlSection) {
            let url = lines[i];
            if (url !== undefined && url.length > 0) {
                url = url.replace(/^ - /, "");
                urls += url + "\n";
            } else urlSection = false;
        }

        // Capture the Issue Background
        else if (lines[i].startsWith("Issue Background:")) {
            issueBGSection = true;
        } else if (issueBGSection) {
            let ibg = lines[i];
            if (ibg !== undefined && ibg !== "~") {
                issueBG += ibg + "\n";
            } else issueBGSection = false;
        }

        // Capture the Remediation Background
        else if (lines[i].startsWith("Remediation Background:")) {
            remedBGSection = true;
        } else if (remedBGSection) {
            let rbg = lines[i];
            if (rbg !== undefined && rbg !== "~") {
                remedBG += rbg + "\n";
            } else remedBGSection = false;
        }

        // Capture the evidence
        else if (lines[i].startsWith("Evidence:")) {
            evidence = t[1].trim();
        }

        // Remove the empty lines with "~" from Burp Clipboarder and
        // keep other unmodified lines.
        else {
            newNotes += lines[i].replace(/^~$/, "") + "\n";
        }
    }

    // Push the captured data to the UI and DB
    if (issueName !== undefined && issueName.length > 0) {
        $("#TIssueName").val(issueName);
    }
    if (issueBG !== undefined && issueBG.length > 0) {
        issueBG = stripHtmlTags(issueBG).replace(/ +/g, " ").trim();
        $("#TIssueBackground").val(issueBG);
        //$("#TIssueBackground").attr("title", issueBG);
    }
    if (remedBG !== undefined && remedBG.length > 0) {
        remedBG = stripHtmlTags(remedBG).replace(/ +/g, " ").trim();
        $("#TRemediationBackground").val(remedBG);
        //$("#TRemediationBackground").attr("title", remedBG);
    }
    if (evidence !== undefined && evidence.length > 0) {
        // Decode the Base64 value
        evidence = decodeURIComponent(
            Array.prototype.map
                .call(atob(evidence), function (c) {
                    return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
                })
                .join("")
        ).trim();
        $("#IEvidence").val(evidence);
        //$("#IEvidence").attr("title", evidence);
    }
    if (urls !== undefined && urls.length > 0) {
        $("#IURIs").val(urls);
        //$("#IURIs").attr("title", urls);
    }
    if (sev >= 0) {
        $("#IPriority").val(sev);
        $("#TSeverity").val(sev);
    }

    // Save the note after removing "~", stripping HTML tags and collapsing
    // multiple spaces (from Burp Clipboarder extension).
    if (newNotes.length > 0) {
        newNotes = stripHtmlTags(newNotes).replace(/ +/g, " ").trim();
        $("#INotes").val(newNotes);
        //$("#INotes").attr("title", newNotes);
    }
}

// Update screenshots from the Images field
function uiUpdateScreenshots() {
    console.info("Updating screenshots area");
    let imgTags = $("#IScreenshots").val();
    $("#IScreenshotsArea").html(imgTags);
}

// Update UI with CWE data
function uiUpdateCwe(cweId, forceUpdate) {
    console.info("Updating UI with CWE data");

    let rec = {};
    if (cweId !== undefined && cweId !== "") {
        console.info("Updating UI for CWE-" + cweId);
        $("#cweIn").val(cweId);
        $("#cweref").attr("href", gCweUriBase + cweId + ".html");

        restGetCwe(cweId, function (cwe) {
            if (cwe !== null) {
                let data = {};
                uiUpdateStatus("Received REST response for CWE ID " + cweId);

                // Update the description in the title (visible via hovering)
                let title = "Click here for more details on CWE-" + cweId;
                $("#cweref").attr("title", title);

                // If the issue name is empty, use the CWE name.
                let issueName = $("#TIssueName").val();
                if (issueName.length <= 0 || forceUpdate) {
                    $("#TIssueName").val(cwe.Name);
                    data["TIssueName"] = cwe.Name;
                }

                // If the issue background is empty, use the CWE description.
                let issueBG = $("#TIssueBackground").val();
                if (issueBG.length <= 0 || forceUpdate) {
                    let description = cwe.Description_Summary;
                    let extendedDescr = cwe.Extended_Description;
                    if (description.length && extendedDescr) description += "\n\n" + extendedDescr;
                    $("#TIssueBackground").val(description);
                    data["TIssueBackground"] = description;
                }

                // If the issue remediation is empty, use the CWE Potential Mitigations.
                let issueRemediation = $("#TRemediationBackground").val();
                if (issueRemediation.length <= 0 || forceUpdate) {
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
                        $("#TRemediationBackground").val(cweMitig);
                        data["TRemediationBackground"] = cweMitig;
                    }
                }

                // Update test data from UI changes related to changing the CWE
                let testId = $("#testIn").val();
                data["TCweID"] = cweId;
                restUpdateTest(testId, data);
            } else {
                msg = "WARNING: Did not receive REST response for CWE " + cweId;
                uiUpdateStatus("<span class='statusHighlight'>" + msg + "</span>");
            }
        });
    } else {
        uiClearCweFields();
    }
}

// Update all UI fields from the Test KB
function uiUpdateFromTestKB(testId) {
    console.info("Updating UI with test KB data");

    // Clear testDB fields before updating them because some UI updates fail due to missing value in DB.
    uiClearTestingFields();
    $("#testIn").val(testId);

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
            if (testRef !== undefined && !testRef.startsWith("http"))
                testRef = gTestRefBase + "/" + testRef;
            $("#TTRefA").attr("href", testRef);

            /*
            $("#TTRef2").val(rec.TTRef2);
            let testRef2 = rec.TTRef2;
            if ((testRef2 !== undefined)&&(!testRef2.startsWith("http")))
                testRef2 = gTestRefBase + testRef2;
            $("#TTRef2A").attr('href', testRef2);
            */

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

            /*
            $("#TType").val(rec.TType);
            $("#TDescr").val(rec.TDescr);
            */
        } else {
            let msg =
                "WARNING: Cannot update UI from TestKB. Record not found for testId '" +
                testId +
                "'.";
            console.warn(msg);
            uiUpdateStatus("<span class='statusHighlight'>" + msg + "</span>");
        }
    });
}

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

// Update all UI fields from the Issue Collection
function uiUpdateFromIssueColl(testID) {
    console.info("Updating UI with issue data");

    // Clear issue fields prior to populating them
    uiClearIssueFields();

    if (testID === undefined || testID === "") {
        console.info("Empty Test ID");
        return;
    }

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
            let msg =
                "NOTE: Could not find an issue for Test ID " + testID + " in project " + prjName;
            console.info(msg);
            uiUpdateStatus(msg);
        }
    });
}

// Update status message in UI
function uiUpdateStatus(msg) {
    $("#StatusMsg").html(msg);
}

// Update the CVE links in the UI
function getSoftwareLinks(software) {
    var swList = software.trim().split(",");
    var swLinksHtml = "";
    for (i = 0; i < swList.length; i++) {
        swLinksHtml +=
            "<a class='smallLink' href='" +
            cveRptBase +
            swList[i].trim() +
            cveRptSuffix +
            "'target='cveRptUI'>" +
            swList[i].trim() +
            "</a>&nbsp;&nbsp;";
    }
    $("#PrjSoftware").html(swLinksHtml);
}

// Reload page (refreshes the displayed test KB entries and issue list)
function reloadPage() {
    location.reload();
}

// Inform user about the need to refresh the page after updates
function alertOnUpdate() {
    // Update LastTID
    let testId = $("#testIn").val();
    //$("#LastTID").html(testId);
    //restUpdateLastTID(testId, prjName);
    //alert("Press Refresh Page button as needed");
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
                alert(
                    "Session is not active, you will be redirected to the login page.",
                    xhr.responseURL
                );
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

setInterval(checkSession, sessionCheckInterval);
