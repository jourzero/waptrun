// When the login link is clicked, initiate the OIDC Auth Code flow
document.getElementById("start").addEventListener("click", async function (e) {
    e.preventDefault();

    // Create and store a random "state" value
    let state = generateRandomString();
    sessionStorage.setItem("oauth_state", state);

    /*
    // Create and store a new nonce
    let nonce = generateNonce(21);
    sessionStorage.setItem("oauth_nonce", nonce);
    */

    // Get redirect_uri, exclude parameters
    let uri = new URL(document.location);
    let redirect_uri = `${uri.origin}${config.redirect_path}`;

    /*
    // Get client id
    //let client_id = encodeURIComponent(document.getElementById("client_id").value);
    let client_id = encodeURIComponent(config.client_id);
    //sessionStorage.setItem("oauth_client_id", client_id);
    */

    /*
    // Get client secret
    //let client_secret = encodeURIComponent(document.getElementById("client_secret").value);
    let client_secret = encodeURIComponent(config.client_secret);
    sessionStorage.setItem("oauth_client_secret", client_secret);
    */

    // Build the authorization URL
    let url = config.authorization_endpoint;
    /*
    if (config.response_type === "code") {
        url +=
            `?response_type=${config.response_type}` +
            `&client_id=${client_id}` +
            `&state=${encodeURIComponent(state)}` +
            `&scope=${encodeURIComponent(config.requested_scopes)}` +
            `&nonce=${nonce}` +
            `&redirect_uri=${encodeURIComponent(redirect_uri)}`;
    }
    */

    // If using OIDC with OAuth2 Implicit Flow, adjust the URI accordingly
    if (config.response_type === "id_token") {
        url +=
            `?response_type=${config.response_type}` +
            `&client_id=${config.client_id}` +
            `&state=${encodeURIComponent(state)}` +
            `&scope=${encodeURIComponent(config.requested_scopes)}` +
            `&include_granted_scope=true` +
            `&redirect_uri=${encodeURIComponent(redirect_uri)}`;
    }

    // Redirect to the authorization server
    window.location = url;
});

// Generate a secure random string using the browser crypto functions
function generateRandomString() {
    var array = new Uint32Array(28);
    window.crypto.getRandomValues(array);
    return Array.from(array, (dec) => ("0" + dec.toString(16)).substr(-2)).join("");
}

/*
// Generate nonce to use in authorization request to Google
function generateNonce(length) {
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
*/
