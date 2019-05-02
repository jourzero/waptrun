// Create New Project
$("#newProjectInput").on("change", evtCreateNewPrj);

// Remove Project
$("#delProjectInput").on("change", evtDeletePrj);

// Delete Project
//$(".delete").on('click', evtDeletePrj);

function showCreateNewProjectBtn() {
    $("#newProjectDiv").prop("hidden", "");
}

function showRemoveProjectBtn() {
    $("#delProjectDiv").prop("hidden", "");
}

function evtCreateNewPrj() {
    let prjName = $("#newProjectInput").val();
    //$("#newProjectDiv").prop("hidden", "true");
    restCreatePrj(prjName);
}

// Delete Project
function evtDeletePrj() {
    let prjName = $("#delProjectInput").val();
    console.info("-- Deleting project " + prjName);
    restDeletePrjIssues(prjName);
    restDeletePrj(prjName);
}
