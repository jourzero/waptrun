//============== UI EVENT HANDLING ==============    
// When values change, persist the values
$("#PrjName").on('change', function()     { 
    let prj = uiGetProject();
    if (prj !== undefined){
        restUpdateProject(prj); 
        url = "/project/" + $("#PrjName").val();
        window.open(url,"_self"); 
    }
});

$("#PrjNotes, #ScopeSel").on('change', function()    { 
    let prj = uiGetProject();
    if (prj !== undefined)
        restUpdateProject(prj); 
});

$("#PrjSoftware").on('change', function() { 
    uiUpdateCveLinks();
    let prj = uiGetProject();
    if (prj !== undefined)
        restUpdateProject(prj); 
});

$("#StartTesting").click(function() { 
    url = "/testing/" + $("#PrjName").val();
    window.open(url,"_self"); 
});

$("#btnHtmlReport").click(function() { 
    url = "/report/html/" + $("#PrjName").val();
    window.open(url,"reportWin"); 
});

$("#btnCsvReport").click(function() { 
    url = "/report/csv/" + $("#PrjName").val();
    window.open(url,"reportWin"); 
});


//============== UI TWEAKS ==============
// Dynamically adjust height of textarea
$("textarea").click(function() {
    $(this).height(200);
});
$("textarea").blur(function() {
    $(this).height(100);
});


//============== FUNCTIONS ==============
// Clear Project Information (may be needed later when we support adding a new project)
function uiClearProjectFields() {
    $("#PrjSoftware").val("");
    $("#CveRptLinks").html("");        
    $("#PrjNotes").val("");
    $("#PrjNotes").attr('title', "");
    $("#ScopeSel").prop("selectedIndex", 0);
};

// Get Project data from UI
function uiGetProject(){
    var prj = {};
    prj.name= $("#PrjName").val().trim();
    prj.notes= $("#PrjNotes").val().trim();
    prj.software= $("#PrjSoftware").val().trim();
    prj.scope = $("#ScopeSel option:selected" ).attr('title').trim();
    prj.scopeQry = $("#ScopeSel").val().trim();
    prj.lastTID = $("#LastTID").html().trim();
    return prj;
}

// Update the CVE links in the UI
function uiUpdateCveLinks(){
    prjSoftware = $("#PrjSoftware").val();
    var swList = prjSoftware.split(",");
    var swLinksHtml="";
    for (i=0; i<swList.length; i++){
        swLinksHtml += "<a class='smallLink' href='" 
                    + cveRptBase
                    + swList[i].trim() 
                    + cveRptSuffix
                    + "'target='cveRptUI'>" + swList[i].trim() + "</a>&nbsp;&nbsp;";
    }
    $("#CveRptLinks").html(swLinksHtml);
};
