//==============================================================================
//                               GLOBALS
//==============================================================================
//const cveRptBase = "https://nvd.nist.gov/products/cpe/search/results?status=FINAL&orderBy=CPEURI&namingFormat=2.3&keyword=";
const cveRptBase = "https://nvd.nist.gov/vuln/search/results?form_type=Advanced&results_type=overview&isCpeNameSearch=true&seach_type=all&query=";
const cveRptSuffix = "";
const thisURL = new URL(window.location);
const nameParm = thisURL.searchParams.get("name");

//==============================================================================
//                               UI RENDERING
//==============================================================================
//----------------------------------------------
//  Populate DOM by rending Handlebar template
//----------------------------------------------
function renderHandlebarTemplate(name) {
    //const fieldList = [ "name", "TTestNameKeyword", "scope", "scopeQry",
    //                  "PciTests", "Top10Tests", "Top25Tests", "StdTests",
    //                  "notes", "software", "TCweIDSearch", ];

    ui = new ReactiveHbs({
        container: ".mount_point",
        template: "#page_template",
        data: {
            name: name,
            TTestNameKeyword: "",
            scope: "",
            scopeQry: "",
            PciTests: false,
            Top10Tests: false,
            Top25Tests: false,
            StdTests: false,
            notes: "",
            software: "",
            TCweIDSearch: "",
        },
    });
    ui.onRendered(function () {
        console.log("onRendered: Registering UI event handlers");
        registerEventHandlers();
    });
    ui.events({
        /*
        'click [id="btnViewReadme"]'(e, elm, tpl) {
            //tpl.set("count", tpl.get("count") + 1);
            const name = tpl.get("name");
            console.debug(`You clicked Help in ${name} project, didn't you? :-)`);
        },
        */

        // React to UI changes to text inputs
        "change textarea,input"(e, elm, tpl) {
            // Get UI value that was changed
            const field = elm.getAttribute("field");
            let value = elm.value;
            if (elm.type === "checkbox") value = elm.checked;
            console.debug(`UI change event: ID=${elm.id} TYPE=${elm.type} FIELD=${field} VALUE=${value}`);

            // Use set() to update model and re-render
            ui.set(field, value);

            // Make UI adjustments - TODO: templatize
            uiUpdateCveLinks();

            // Update project data in backend
            restUpdateProject(ui.getData());
        },

        // React to UI changes for scope selector/filter
        'change [id="ScopeSel"]'(e, elm, tpl) {
            // If it's the scope selector, also get the
            let scope = $("#ScopeSel option:selected").attr("title").trim();
            let scopeQry = $("#ScopeSel").val().trim();

            // Use set() to update model and re-render
            ui.set("scope", scope);
            ui.set("scopeQry", scopeQry);

            // Make UI adjustments - TODO: templatize?
            console.debug("Placing scope selector back in place");
            $("#ScopeSel").val(scopeQry);

            // Update project data in backend
            restUpdateProject(ui.getData());
        },
    });
    ui.reactOnChange("software", {throttle: 100}, (tpl) => {
        console.info("reactOnChange: template data has been changed ", JSON.stringify(tpl.get("software")));
        //updateProjectData(name);
    });
    console.debug("Rendering template");
    ui.render();

    //----------------------------------------------
    // Populate UI from DB
    //----------------------------------------------
    function updateFromDB(name) {
        console.debug(`Getting data for ${name}`);
        restGetProject(name, function (prj) {
            if (prj !== null) {
                // Update model
                if (!prj.PciTests) prj.PciTests = false;
                if (!prj.Top10Tests) prj.Top10Tests = false;
                if (!prj.Top25Tests) prj.Top25Tests = false;
                if (!prj.StdTests) prj.StdTests = false;
                console.info(`Data: ${JSON.stringify(prj)}`);
                ui.setData(prj);

                // Make UI adjustments - TODO: templatize?
                console.debug("Tweaking UI (moved to template later?)");
                $("#ScopeSel").val(prj.scopeQry);
                uiUpdateCveLinks();
            }
        });
    }
    updateFromDB(name);

    // Update the CVE links in the UI
    function uiUpdateCveLinks() {
        let prjSoftware = $("#PrjSoftware").val();
        let swList = prjSoftware.split(",");
        let swLinksHtml = "";
        for (let i = 0; i < swList.length; i++) {
            swLinksHtml += "<a class='smallLink' href='" + encodeURI(cveRptBase + swList[i].trim() + cveRptSuffix) + "'target='cveRptUI'>" + validator.escape(swList[i].trim()) + "</a>&nbsp;&nbsp;";
        }
        $("#CveRptLinks").html(swLinksHtml);
        console.debug(`CVE Lookup links updated for software ${prjSoftware}`);
    }
}

//==============================================================================
//                               UI EVENTS
//==============================================================================
function registerEventHandlers() {
    $("#StartTesting").click(function () {
        let url = "/testing?name=" + $("#PrjName").val();
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
        $(this).height(50);
    });
}

// Call the above function to populate the DOM
if (nameParm === null) alert("Missing name parameter in URI, please add '?name=<NAME>'.");
else renderHandlebarTemplate(nameParm);
