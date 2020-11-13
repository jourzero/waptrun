//============== UI EVENT HANDLING ==============
// When values change, persist the values
$("#PrjName").on("change", function () {
    let prj = uiGetProject();
    if (prj !== undefined) {
        restUpdateProject(prj);
        let url = "/project/" + $("#PrjName").val();
        window.open(url, "_self");
    }
});

$(
    "#PrjNotes, #ScopeSel, #TPCI, #TTop10, #TTop25, #TStdTest,#TTestNameKeyword"
).on("change", function () {
    let prj = uiGetProject();
    if (prj !== undefined) restUpdateProject(prj);
});

$("#PrjSoftware").on("change", function () {
    uiUpdateCveLinks();
    let prj = uiGetProject();
    if (prj !== undefined) restUpdateProject(prj);
});

$("#StartTesting").click(function () {
    let url = "/testing/" + $("#PrjName").val();
    window.open(url, "_self");
});

$("#btnFindingsHtmlReport").click(function () {
    let url = "/export/html/findings/" + $("#PrjName").val();
    window.open(url, "reportWin");
});

$("#btnFullHtmlReport").click(function () {
    let url = "/export/html/full/" + $("#PrjName").val();
    window.open(url, "reportWin");
});

$("#btnCsvReport").click(function () {
    let url = "/export/csv/" + $("#PrjName").val();
    window.open(url, "reportWin");
});

$("#btnJsonExport").click(function () {
    let url = "/export/json/" + $("#PrjName").val();
    window.open(url, "reportWin");
});

//============== UI TWEAKS ==============
// Dynamically adjust height of textarea
$("textarea").click(function () {
    $(this).height(200);
});
$("textarea").blur(function () {
    $(this).height(15);
});

//============== FUNCTIONS ==============
// Clear Project Information (may be needed later when we support adding a new project)
function uiClearProjectFields() {
    $("#PrjSoftware").val("");
    $("#CveRptLinks").html("");
    $("#PrjNotes").val("");
    $("#PrjNotes").attr("title", "");
    $("#ScopeSel").prop("selectedIndex", 0);
    $("#TPCI").prop("checked", false);
    $("#TTop10").prop("checked", false);
    $("#TTop25").prop("checked", false);
    $("#TStdTest").prop("checked", false);
}

// Get Project data from UI
function uiGetProject() {
    var prj = {};
    prj.name = $("#PrjName").val().trim();
    prj.notes = $("#PrjNotes").val().trim();
    prj.software = $("#PrjSoftware").val().trim();
    prj.scope = $("#ScopeSel option:selected").attr("title").trim();
    prj.scopeQry = $("#ScopeSel").val().trim();
    prj.lastTID = $("#LastTID").html().trim();
    prj.TTestNameKeyword = $("#TTestNameKeyword").val().trim();
    prj.PciTests = $("#TPCI").prop("checked");
    prj.Top10Tests = $("#TTop10").prop("checked");
    prj.Top25Tests = $("#TTop25").prop("checked");
    prj.StdTests = $("#TStdTest").prop("checked");
    return prj;
}

// Update the CVE links in the UI
function uiUpdateCveLinks() {
    let prjSoftware = $("#PrjSoftware").val();
    let swList = prjSoftware.split(",");
    let swLinksHtml = "";
    for (let i = 0; i < swList.length; i++) {
        swLinksHtml +=
            "<a class='smallLink' href='" +
            encodeURI(cveRptBase + swList[i].trim() + cveRptSuffix) +
            "'target='cveRptUI'>" +
            validator.escape(swList[i].trim()) +
            "</a>&nbsp;&nbsp;";
    }
    $("#CveRptLinks").html(swLinksHtml);
}
