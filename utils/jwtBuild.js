'use strict'

const fs = require('fs');
const jose = require('jose');

function makeRandomString(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function buildJWT(iss, username, kid, privateKeyFileName) {
    const expiryPeriod = 24 * 3600; // Expire after 24 hours

    const date = new Date();
    const seconds = Math.floor(date.getTime() / 1000);
    const payload = {
        iss: iss, // organization_name in the Config Database.
        aud: "NUANCE", // Always NUANCE
        jti: makeRandomString(22),
        sub: username,
        email: "agt@tc.com", // Some random email
        iat: seconds,
        nbf: seconds,
        exp: Math.floor(seconds + expiryPeriod)
    };

    if (payload.exp < seconds) {
        console.error('WARNING: bad expiration');
    }

    //const privateKey = jose.JWK.asKey(fs.readFileSync(privateKeyFileName));
    const algorithm = 'ES256'
    const pkcs8 = fs.readFileSync(privateKeyFileName);
    console.debug(`PKCS8 key: ${pkcs8}`)
    //const ecPrivateKey = await jose.importPKCS8(pkcs8, algorithm)
    jose.importPKCS8(pkcs8, algorithm, (privateKey) => {


        var token = jose.JWS.sign(
            payload,
            privateKey,
            {
                alg: 'RS256',
                typ: 'JWT',
                kid: kid
            });

        return token;
    });
}

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

