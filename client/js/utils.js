function log(msg) {
    console.info(msg);
}

// Strip tags from HTML text and return plain text.
function stripHtmlTags(html) {
    //log("Stripping out HTML tags from " + html);
    let tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
}

// Get severity value from severity string
function getSevVal(sevStr) {
    let sev = -1;
    switch (sevStr) {
        case "Info":
        case "Information":
        case "Informational":
            sev = 0;
            break;
        case "Low":
            sev = 1;
            break;
        case "Med":
        case "Medium":
            sev = 2;
            break;
        case "High":
            sev = 3;
            break;
        case "Critical":
            sev = 4;
            break;
        default:
            sev = -1;
    }
    return sev;
}

// Get severity texgt from severity value
function getSevText(val) {
    let sevVal = Number(val);
    let sev = "Unknown";
    switch (sevVal) {
        case 0:
            sev = "Info";
            break;
        case 1:
            sev = "Low";
            break;
        case 2:
            sev = "Medium";
            break;
        case 3:
            sev = "High";
            break;
        case 4:
            sev = "Critical";
            break;
    }
    return sev;
}

// Get priority value from string value
function getPriorityVal(prioStr) {
    let prio = -1;
    switch (prioStr) {
        case "Info":
        case "Information":
        case "Informational":
            prio = 5;
            break;
        case "Low":
            prio = 4;
            break;
        case "Med":
        case "Medium":
            prio = 3;
            break;
        case "High":
            prio = 2;
            break;
        case "Critical":
            prio = 1;
            break;
        default:
            prio = -1;
    }
    return prio;
}

// Get priority text from numerical value
function getPriorityText(val) {
    let prioVal = Number(val);
    let prio = "Unknown";
    switch (prioVal) {
        case 1:
            prio = "Critical";
            break;
        case 2:
            prio = "High";
            break;
        case 3:
            prio = "Medium";
            break;
        case 4:
            prio = "Low";
            break;
        case 5:
            prio = "Info";
            break;
        case 6:
            prio = "TODO";
            break;
        case 7:
            prio = "Fixed";
            break;
        case 8:
            prio = "Tested";
            break;
        case 9:
            prio = "Exclude";
            break;
    }
    return prio;
}

// Establish a priority value from severity text
function getPrioFromSevText(sevText) {
    priority = getPriorityVal(sevText);
    return priority;
}

// Show success message message
function successMessage(msg) {
    if (msg !== undefined) {
        clearMsg();
        $("#msg").addClass("alert alert-success");
        $("#msg").html(msg);
        setTimeout(clearMsg, 2000);
    }
}

// Show warning message message
function errorMessage(msg) {
    if (msg !== undefined) {
        clearMsg();
        $("#msg").addClass("alert alert-danger");
        $("#msg").html(errMsg);
        setTimeout(clearMsg, 8000);
        alert(msg);
    }
}

// Show warning message message
function warningMessage(msg) {
    if (msg !== undefined) {
        clearMsg();
        $("#msg").addClass("alert alert-warning");
        $("#msg").html(msg);
        setTimeout(clearMsg, 8000);
        alert(msg);
    }
}

// Clear status message popup
function clearMsg() {
    $("#msg").html("");
    $("#msg").removeClass("alert-success alert-warning alert-danger ");
}
