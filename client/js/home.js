// Create New Project
$("#newProjectInput").on('change', evtCreateNewPrj);

// Remove Project
$("#delProjectInput").on('change', evtDeletePrj);

// Delete Project
//$(".delete").on('click', evtDeletePrj);

function showCreateNewProjectBtn(){
    $("#newProjectDiv").prop("hidden", "");
}    

function showRemoveProjectBtn(){
    $("#delProjectDiv").prop("hidden", "");
}    

function evtCreateNewPrj(){
    let prjName = $("#newProjectInput").val();
    //$("#newProjectDiv").prop("hidden", "true");
    restCreatePrj(prjName);
    alert("Inserted a new project " + prjName + ".");        
    console.log("Reloading the page");
    location.reload();
} 

// Delete Project
function evtDeletePrj() {
    let prjName = $("#delProjectInput").val();
    console.log("-- Deleting project " + prjName);
    restDeletePrj(prjName);
    alert("Deleted the project " + prjName);
    restDeletePrjIssues(prjName);
    alert("Deleted the issues for project " + prjName);
    console.log("Reloading the page");
    location.reload();
};

