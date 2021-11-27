//==============================================================================
//                               UI RENDERING
//==============================================================================
//----------------------------------------------
//  HOME PAGE TEMPLATE
//----------------------------------------------
let ui = new ReactiveHbs({
    container: ".homepage_mount_point",
    template: "#homepage_template",
    data: {
        projects: [{name: "__name__"}],
    },
});
ui.events({
    // React to UI changes to text inputs
    "change input": function (e, elm, tpl) {
        // Get UI value that was changed
        console.debug(`UI change event: ID=${elm.id} TYPE=${elm.type} VALUE=${elm.value}`);
        if (elm.id == "newProjectInput") evtCreateNewPrj();
        else if (elm.id == "delProjectInput") evtDeletePrj();
        //e.stopPropagation();
        uiPopulate();
    },
});
ui.onRendered(function () {
    console.debug("onRendered: nothing else to do for now");
    /*
    console.debug("onRendered: Registering UI event handlers for home page");
    // Create New Project
    $("#newProjectInput").on("change", evtCreateNewPrj);

    // Remove Project
    $("#delProjectInput").on("change", evtDeletePrj);
    */
});

// Populate UI from DB data
function uiPopulate() {
    console.debug(`Getting project list`);
    restGetProjects(function (data) {
        if (data !== null) {
            //successMessage("Project data extraction succeeded");
            // Update model (combine config data with flattened project data)
            ui.setData({projects: data});
        }
    });
}

// Render and populate
ui.render();
uiPopulate();

//==============================================================================
//                                FUNCTIONS
//==============================================================================

function showCreateNewProjectBtn() {
    $("#newProjectDiv").prop("hidden", "");
}

function showRemoveProjectBtn() {
    $("#delProjectDiv").prop("hidden", "");
}

function evtCreateNewPrj() {
    let prjName = $("#newProjectInput").val();
    //$("#newProjectDiv").prop("hidden", "true");
    console.info(`Creating new project ${prjName}`);
    restCreatePrj(prjName);
}

// Delete Project
function evtDeletePrj() {
    let prjName = $("#delProjectInput").val();
    console.info("-- Deleting project " + prjName);
    restDeletePrjIssues(prjName);
    restDeletePrj(prjName);
}
