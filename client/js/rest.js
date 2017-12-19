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
    if ((testId === undefined) || (testId === "")){        
        let msg = "WARNING: Cannot delete issue data: Missing Test ID";
        console.log(msg);
        uiUpdateStatus("<span class='statusHighlight'>" + msg + "</span>");
        return;
    }
    if ((prjName === undefined) || (prjName === "")){
        let msg = "WARNING: Cannot delete issue data: Missing Project Name";
        console.log(msg);
        uiUpdateStatus("<span class='statusHighlight'>" + msg + "</span>");
        return;
    }    

    // Send REST call for issue data
    let url = "/api/issue/" + prjName + "/" + testId; 
    console.log("Sending DELETE request to " + url);
    return $.ajax({
       url: url,
       type: 'DELETE',
     });
}


// Get CWE data for a CWE ID
function restGetCwe(cweId, callback){
    
    // Send REST call for issue data
    let url = "/api/cwe/" + cweId; 
    let cwe = {};

    console.log("Sending GET request to " + url);
    $.get(url, callback);
};


// Get Issue data for a specific test/project


function restGetIssue(testId, prjName, callback){
    
    // Send REST call for issue data
    let url = "/api/issue/" + prjName + "/" + testId; 
    console.log("Sending GET request to " + url);
    $.get(url, callback);
};


// Get test data from test KB
function restGetTest(testId, callback){
    
    let url = "/api/testkb/" + testId; 
    console.log("Sending GET request to " + url);
    $.get(url, callback);
};

// Update/insert issue data from UI to the issue collection
function restUpdateIssue(issue) {

    // Check that the UI has the mandatory data we need
    if ((issue.TID === undefined) || (issue.TID === "")){        
        let msg = "WARNING: Cannot save issue data: Missing Test ID";
        console.log(msg);
        uiUpdateStatus("<span class='statusHighlight'>" + msg + "</span>");
        return;
    }
    if ((issue.PrjName === undefined) || (issue.PrjName === "")){
        let msg = "WARNING: Cannot save issue data: Missing Project Name";
        console.log(msg);
        uiUpdateStatus("<span class='statusHighlight'>" + msg + "</span>");
        return;
    }    

    // Check if issue already exists
    let op={}; 
    op["$set"] = issue;
 
    let url  = "/api/issue/" + issue.PrjName + "/" + issue.TID;
    console.log("Sending PUT request to url " + url + " with data " + JSON.stringify(op));
    
    let request = $.ajax({
      url: url,
      type: "PUT",
      contentType: "application/json",
      data: JSON.stringify(op),
      dataType: "json"
    });
}


// TODO: Save LastTID to Project collection
function restUpdateLastTID(testId, prjName){    
    
    console.log("Updating LastTID for project " + prjName);

    // Check if issue already exists
    let op={}; 
    op["$set"] = {lastTID: testId}; 

    var data =  JSON.stringify(op);

    let url = "/api/project/" + prjName;
    console.log("Sending PUT request to url " + url + " with data " + data);
    var request = $.ajax({
      url: url,
      type: "PUT",
      contentType: "application/json",
      data: data,
      dataType: "json"
    });
};


// Save all values to Project Collection
function restUpdateProject(prj){
    
    console.log("Updating project " + prjName);

    let data =  JSON.stringify(prj);
    let url  = "/api/project/" + prjName;

    console.log("Sending PUT request to url " + url + " with data " + data);
    var request = $.ajax({
      url: url,
      type: "PUT",
      contentType: "application/json",
      data: data,
      dataType: "json"
    });
};


// Update/insert test data to the TestKB collection
function restUpdateTest(testId, data) {

    let op = {};
    op["$set"] = data;

    // Send put request
    let url  = "/api/testkb/" + testId;
    console.log("Sending PUT request to url " + url + " with data " + JSON.stringify(op));
    let request = $.ajax({
      url: url,
      type: "PUT",
      contentType: "application/json",
      data: JSON.stringify(op),
      dataType: "json"
    });
    
};


// Add new entry to TestKB
function restCreateTest() {

    kvp = {}; mod = {};
    tid = new Date().toISOString().split(".")[0].replace(/[-:]/g, '');
    kvp.TID       = "EXT-" + tid;
    kvp.TSource   = "Extras";
    kvp.TTestName = ""; 
    kvp.TPhase    = "Extras";
    alert("Inserted a new blank test " + kvp.TID + ".");

    // Send post request
    let url  = "/api/testkb"
    console.log("Sending POST request to url " + url + " with data " + JSON.stringify(kvp));
    let request = $.ajax({
      url: url,
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify(kvp),
      dataType: "json"
    });
}
