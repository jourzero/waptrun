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
        case "Information":
            sev = 0;
            break;
        case "Low":
            sev = 1;
            break;
        case "Medium":
            sev = 2;
            break;
        case "High":
            sev = 3;
            break;
        default:
            sev = -1;
    }
    return sev;
}
