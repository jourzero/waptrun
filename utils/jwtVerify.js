const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");
//const fs = require('fs');

// ========================================== CONFIG ==========================================
// Load .env file
require("dotenv").config();
//console.debug(`Environment: ${JSON.stringify(process.env, null, 4)}`);

// Retrieve signing keys from the Google JWKS (JSON Web Key Set) endpoint.
// NOTE: From below Google ref.: The implicit flow is used when a client-side app (typically a JavaScript app running in the browser) needs to access APIs directly instead of via its back-end server.
// Refs: https://developers.google.com/identity/protocols/oauth2/openid-connect#discovery
//       https://www.npmjs.com/package/jwks-rsa
const googleOpenidConfigUrl = "https://accounts.google.com/.well-known/openid-configuration";
const googleCertUrl = "https://www.googleapis.com/oauth2/v3/certs";
const jwks_client = jwksClient({
    //jwksUri: googleOpenidConfigUrl,
    jwksUri: googleCertUrl,
    timeout: 10000
});
let publicKey = undefined;
function getKey(header, callback) {
    if (publicKey)
        callback(null, publicKey);
    else {
        console.debug(`Getting Google's OAuth public key associated with received key ID. JWT Header: ${JSON.stringify(header)}`);
        jwks_client.getSigningKey(header.kid, function (err, key) {
            if (err) {
                console.error(`Error getting signing key: ${err.message}`);
                publicKey = undefined;
                callback(null, publicKey);
                return;
            }
            if (key === undefined) {
                console.error(`Could not find key id ${header.kid}`);
                publicKey = undefined;
                callback(null, publicKey);
                return;
            }
            //publicKey = key.publicKey || key.rsaPublicKey;
            publicKey = key.getPublicKey();
            console.debug(`Saving extracted Google OAuth public key to memory: ${publicKey}`);
            callback(null, publicKey);
        });
    }
}

function jwtDecode(token) {

    // Check JWT - ref.: https://www.npmjs.com/package/jsonwebtoken
    let options = {};
    options = {aud: process.env["GOOGLE_CLIENT_ID"], iss: "accounts.google.com"};
    //jwt.verify(token, config.googleRsaPublicKey, options, function (err, decoded) {
    // Verify using getKey callback
    jwt.verify(token, getKey, options, function (err, decoded) {
        if (err) {
            console.error(`Could not verify token: ${err.message}`);

            // Clear cached Google public key in case it changed and it's causing the issue
            publicKey = undefined;

            // If the bearer token is expired, expire the cookie to clear it
            if (err.name === "TokenExpiredError") {
                console.info(`JWT expired`);
            }
        }
        console.info(`Token payload: ${JSON.stringify(decoded)}`);
    });
}

/*
if (process.argv.length < 6) {
    console.error('ERROR: Not enough args.\n');
    console.error('Usage:');
    console.error('    node ' + process.argv[1] + ' iss username kid privateKeyFileName\n');
    console.error('Example:');
    console.error('    node ' + process.argv[1] + ' ACME apiuser@acme.com ACME-2020-07-01 ./privatekey.pem\n');
    console.error('To generate the private key:');
    console.error('    openssl genrsa -out privatekey.pem 2048\n');
    console.error('To extract the public key:');
    console.error('    openssl rsa -in privatekey.pem -pubout -out publickey.pem -outform PEM\n');
    console.error('To verify the JWT:');
    console.error('    Go to https://jwt.io/.');
    console.error('    Paste the JWT in the Encoded box.');
    console.error('    Paste the publickey.pem file content in the VERIFY SIGNATURE box');
    console.error('    You should see the JWT content and "Signature Verified".');
    process.exit(1);
}

var config = {
    iss: process.argv[2],
    username: process.argv[3],
    kid: process.argv[4],
    privateKeyFileName: process.argv[5]
}

var jwt = buildJWT(config.iss, config.username, config.kid, config.privateKeyFileName);
console.log(jwt);
*/

if (process.argv.length < 3) {
    console.error(`ERROR: Not enough args: ${JSON.stringify(process.argv)}`);
    console.error('Usage:');
    console.error('    node ' + process.argv[1] + ' <JWT_STRING>\n');
    process.exit(1);
}

jwtDecode(process.argv[2]);
