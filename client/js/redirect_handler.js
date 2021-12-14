// Handle the redirect back from OAuth server and get token
var id_token = undefined;
if (window.location.hash.length > 0) {
    let q = parseQueryString(window.location.hash.substring(1));

    // Check if the server returned an error string
    if (q.error) {
        console.error("Error returned from authorization server: " + q.error);
        document.getElementById("error_details").innerText = q.error + "\n\n" + q.error_description;
        document.getElementById("error").classList = "";
    }

    if (config.response_type === "id_token") {
        // Display token data in the browser.
        id_token = q.id_token;
        let jwt_payload = JSON.parse(atob(q.id_token.split(".")[1]));

        // Remove session storage content we don't need
        let savedState = sessionStorage.getItem("oauth_state");
        if (savedState !== q.state) {
            console.error("Invalid state, clearing id_token");
            id_token = undefined;
            // TODO logout
        } else console.debug(`State value received (${q.state}) matches saved value`);
        sessionStorage.removeItem("oauth_state");

        // Replace the history entry to remove the auth code from the browser address bar
        window.history.replaceState({}, null, "/home");
    }
}

// Parse a query string into an object
function parseQueryString(string) {
    if (string == "") {
        return {};
    }
    var segments = string.split("&").map((s) => s.split("="));
    var queryString = {};
    segments.forEach((s) => (queryString[s[0]] = s[1]));
    return queryString;
}
