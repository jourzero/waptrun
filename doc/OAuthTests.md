# OAuth Tests

<!-- TOC -->

-   [OAuth Tests](#oauth-tests)
    -   [Okta OAuth2 course](#okta-oauth2-course)
        -   [Utilities](#utilities)
        -   [Exercise 1: Preparation](#exercise-1-preparation)
        -   [Exercise 2: OAuth for Web Apps](#exercise-2-oauth-for-web-apps)
        -   [Exercise 3: Refresh Tokens](#exercise-3-refresh-tokens)
        -   [Exercise 4: OpenID Connect](#exercise-4-openid-connect)
    -   [References](#references)

<!-- /TOC -->

## Okta OAuth2 course

OAuth 2.0 has become the industry standard for providing secure access to web APIs, allowing applications to access users' data without compromising security. Companies around the world add OAuth to their APIs to enable secure access from their own mobile apps and third-party IoT devices and even access to banking APIs.
Security expert Aaron Parecki breaks down each of the OAuth flows (grant types) and applies them to use cases such as implementing OAuth for web apps, native apps, and SPAs. In addition to learning how applications can use OAuth to access APIs, you’ll learn how to use OpenID Connect to get the user’s identity.

With Aaron Parecki
Click to view the full event details or join when the event is in session: https://learning.oreilly.com/accounts/login-check/?next=/live-training/courses/-/0636920066402/

### Utilities

Utilities Used:

-   https://example-app.com/pkce
-   https://example-app.com/client
-   https://example-app.com/base64

### Exercise 1: Preparation

Ref.: [Exercise 1: Preparing for the exercise](https://on24static.akamaized.net/event/35/17/92/6/rt/1/documents/resourceList1643415440760/exercise1preparingfortheexercises1643415440423.pdf)

Details:

-   Login:
    -   Browse to **https://dev-80639559.okta.com/login/login.htm**
    -   Click **Need help signing in?**
    -   Click **Signin with Google**
-   Authorization server config: https://dev-80639559.okta.com/oauth2/default/.well-known/oauth-authorization-server (subset below)

```JSON
{
  "issuer": "https://dev-80639559.okta.com/oauth2/default",
  "authorization_endpoint": "https://dev-80639559.okta.com/oauth2/default/v1/authorize",
  "token_endpoint": "https://dev-80639559.okta.com/oauth2/default/v1/token",
  "registration_endpoint": "https://dev-80639559.okta.com/oauth2/v1/clients",
  "jwks_uri": "https://dev-80639559.okta.com/oauth2/default/v1/keys",
  "response_types_supported": [
    "code",
    "token",
    "id_token",
    "code id_token",
    "code token",
    "id_token token",
    "code id_token token"
  ],
  "grant_types_supported": [
    "authorization_code",
    "implicit",
    "refresh_token",
    "password",
    "client_credentials",
    "urn:ietf:params:oauth:grant-type:device_code"
  ],
  "scopes_supported": [
    "photos",
    "openid",
    "profile",
    "email",
    "address",
    "phone",
    "offline_access",
    "device_sso"
  ],
  "claims_supported": [
    "ver",
    "jti",
    "iss",
    "aud",
    "iat",
    "exp",
    "cid",
    "uid",
    "scp",
    "sub"
  ],
  "...": "..."
}
```

### Exercise 2: OAuth for Web Apps

Ref.: [Exercise 2: OAuth for Web Server Apps](https://on24static.akamaized.net/event/35/17/92/6/rt/1/documents/resourceList1643415449688/exercise2oauthforwebserverapplications1643415449080.pdf)

-   https://dev-80639559.okta.com/oauth2/default/.well-known/oauth-authorization-server
-   Client ID: 0oa3rly6zfiROV1Ky5d7
-   Client Secret: 6oI8NbH1YfOvvMm4HnLXyl0OYCGxdWDWBVd4A1i0

-   Get Code Challenge in Base64 using this: https://example-app.com/pkce
-   Random string as Code Verifier (random secret): dbbb3ca3bfb7f18450e0b2efcce67748fc1ddc33271b8ae60545dddf
-   Code Challenge (Base64UrlEncode(sha256(Code Verifier)): 5Qd3esJXMwCPUAiV7saCh1KA3q1bC0Pku2mou2jyG70
-   Implementation help: see the client-side code in the above example-app.com URL

-   Authz Request: https://dev-80639559.okta.com/oauth2/default/v1/authorize?response_type=code&scope=photos&client_id=0oa3rly6zfiROV1Ky5d7&state=0a9ef0ae9fu&redirect_uri=https://example-app.com/redirect&code_challenge=5Qd3esJXMwCPUAiV7saCh1KA3q1bC0Pku2mou2jyG70&code_challenge_method=S256
-   Response: https://example-app.com/redirect?code=S9R1z-lp2IkuamZudW619ERKAHMgeVyq8hwvDbfXDts&state=0a9ef0ae9fu

```
Congrats!
The authorization server redirected you back to the app and issued an authorization code!
You can exchange this authorization code for an access token now!
Your app can read the authorization code and state from the URL, and they are printed below for your convenience as well.
code=S9R1z-lp2IkuamZudW619ERKAHMgeVyq8hwvDbfXDts
state=0a9ef0ae9fu
You should verify that the state parameter here matches the one you set at the beginning. Otherwise it's possible someone is trying to trick your app!
```

```bash
host[waptrun]$ curl -X POST https://dev-80639559.okta.com/oauth2/default/v1/token \
> -d grant_type=authorization_code \
> -d redirect_uri=https://example-app.com/redirect \
> -d client_id=0oa3rly6zfiROV1Ky5d7 \
> -d client_secret=6oI8NbH1YfOvvMm4HnLXyl0OYCGxdWDWBVd4A1i0 \
> -d code_verifier=dbbb3ca3bfb7f18450e0b2efcce67748fc1ddc33271b8ae60545dddf \
> -d code=S9R1z-lp2IkuamZudW619ERKAHMgeVyq8hwvDbfXDts
```

```json
{
    "token_type": "Bearer",
    "expires_in": 3600,
    "access_token": "eyJraWQiOiJzX3BSVnZfZWs0Qlptbm00R3Q0OVlJeUNTcXVxTTBLUGRDZEtwZURwZXpVIiwiYWxnIjoiUlMyNTYifQ.eyJ2ZXIiOjEsImp0aSI6IkFULldoMmF5NHd5Vl9MNmttRHNTR0NDWUhKaGp5bElSbVlKVTlhLWRtMjlJM2ciLCJpc3MiOiJodHRwczovL2Rldi04MDYzOTU1OS5va3RhLmNvbS9vYXV0aDIvZGVmYXVsdCIsImF1ZCI6ImFwaTovL2RlZmF1bHQiLCJpYXQiOjE2NDM2NTgwNDMsImV4cCI6MTY0MzY2MTY0MywiY2lkIjoiMG9hM3JseTZ6ZmlST1YxS3k1ZDciLCJ1aWQiOiIwMHUzcmxiZWFtcEJ0QjgyWDVkNyIsInNjcCI6WyJwaG90b3MiXSwic3ViIjoicGNkZXJpY0BnbWFpbC5jb20ifQ.AaSCO3Jw1iPDAV-4KjznXzE1Hver1iW6wNhehfKSo6pmm-sk-re0bzUX3X843bm6yiG2v1UOCF7sOpMHSKWdSkHX-B4wR1hotaSyAtn7fwn_a2dl-S0TnHsLRp4TohFS34CXASvaCYsAf2jZp-uqwARbBKxdXyd_88CA9d61dmYxiFb3scwlERHQbZ0UgOYwtB5wA2GpULUkzrpSpzow00ZeUZEnIpkAwPx3BeO5w_V879lFOvjQy1m0lH0wXS-Hp8StAAczAUHWZf2V2BDDodk6SjfUSI1lzwSf59JAs63RStQVmgYmBupMa6uzruJZD-_F6ANGK1IJyTlgM1BqUQ",
    "scope": "photos"
}

Payload from token:
{
  "ver": 1,
  "jti": "AT.Wh2ay4wyV_L6kmDsSGCCYHJhjylIRmYJU9a-dm29I3g",
  "iss": "https://dev-80639559.okta.com/oauth2/default",
  "aud": "api://default",
  "iat": 1643658043,
  "exp": 1643661643,
  "cid": "0oa3rly6zfiROV1Ky5d7",
  "uid": "00u3rlbeampBtB82X5d7",
  "scp": [
    "photos"
  ],
  "sub": "pcderic@gmail.com"
}
```

### Exercise 3: Refresh Tokens

Ref.: [Exercise 3: Refresh Tokens](https://on24static.akamaized.net/event/35/17/92/6/rt/1/documents/resourceList1643415458105/exercise3refreshtokens1643415457671.pdf)
https://oauth.school/exercise/refresh/

> Now you’ll want to start a new OAuth flow and request a refresh token. Build the authorization
> URL like you did in the previous lesson, but this time also add the scope offline_access to the
> request.

I reused the below from before:

-   Random string as Code Verifier (random secret): dbbb3ca3bfb7f18450e0b2efcce67748fc1ddc33271b8ae60545dddf
-   Code Challenge (Base64UrlEncode(sha256(Code Verifier)): 5Qd3esJXMwCPUAiV7saCh1KA3q1bC0Pku2mou2jyG70
    0oa3rn7tz72HtY9V65d7

_Authorization Request_

```
https://dev-80639559.okta.com/oauth2/default/v1/authorize?response_type=code
    &scope=offline_access+photos
    &client_id=0oa3rn7tz72HtY9V65d7
    &state=111122223333444
    &redirect_uri=https://example-app.com/redirect
    &code_challenge=5Qd3esJXMwCPUAiV7saCh1KA3q1bC0Pku2mou2jyG70
    &code_challenge_method=S256
```

Redirected to: https://example-app.com/redirect?code=6CkoBmlUJC8cZuriXCg_NA1mF4JIbTN-LaO-pdaiKC4&state=111122223333444

```
Congrats!

The authorization server redirected you back to the app and issued an authorization code!

You can exchange this authorization code for an access token now!

Your app can read the authorization code and state from the URL, and they are printed below for your convenience as well.

code=6CkoBmlUJC8cZuriXCg_NA1mF4JIbTN-LaO-pdaiKC4

state=111122223333444

You should verify that the state parameter here matches the one you set at the beginning. Otherwise it's possible someone is trying to trick your app!
```

```bash
CLIENTID=0oa3rn7tz72HtY9V65d7
CODE=6CkoBmlUJC8cZuriXCg_NA1mF4JIbTN-LaO-pdaiKC4
host[waptrun]$ curl -X POST https://dev-80639559.okta.com/oauth2/default/v1/token -d grant_type=authorization_code -d redirect_uri=https://example-app.com/redirect -d client_id=$CLIENTID -d code_verifier=dbbb3ca3bfb7f18450e0b2efcce67748fc1ddc33271b8ae60545dddf -d code=$CODE
```

```JSON
{"token_type":"Bearer","expires_in":3600,"access_token":"eyJraWQiOiJzX3BSVnZfZWs0Qlptbm00R3Q0OVlJeUNTcUXF2V3k1ZDYiLCJpc3MiOiJodHRwczovL2Rldi04MDYzOTU1OS5va3RhLmNvbS9vYXV0aDIvZGVmYXVsdCIsImF1ZCI6ImFwaTovL2ZmZsaW5lX2FjY2VzcyIsInBob3RvcyJdLCJzdWIiOiJwY2RlcmljQGdtYWlsLmNvbSJ9.hXPJuTAZCTMjVxY8EwjIN6M3ESG2doHYUjRfDtNE1izFMSggvjSJiwN7tezaeGAUh5JJ1jSKIKqXRIs_EZ77F_pHVMdU2SM28RqrIUnkJ3_rNt7-XpDti7cn_BHXlqnKFJdJRf3
```

```
host[waptrun]$ curl -X POST https://dev-80639559.okta.com/oauth2/default/v1/token -d grant_type=authorization_code -d redirect_uri=https://example-app.com/redirect -d client_id=$CLIENTID -d code_verifier=dbbb3ca3bfb7f18450e0b2efcce67748fc1ddc33271b8ae60545dddf -d code=$CODE
{"token_type":"Bearer","expires_in":3600,"access_token":"eyJraWQiOiJzX3BSVnZfZWs0Qlptbm00R3Q0OVlJeUNTcUXF2V3k1ZDYiLCJpc3MiOiJodHRwczovL2Rldi04MDYzOTU1OS5va3RhLmNvbS9vYXV0aDIvZGVmYXVsdCIsImF1ZCI6ImFwaTovL2ZmZsaW5lX2FjY2VzcyIsInBob3RvcyJdLCJzdWIiOiJwY2RlcmljQGdtYWlsLmNvbSJ9.hXPJuTAZCTMjVxY8EwjIN6M3ESG2doHYUjRfDtNE1izFMSggvjSJiwN7tezaeGAUh5JJ1jSKIKqXRIs_EZ77F_pHVMdU2SM28RqrIUnkJ3_rNt7-XpDti7cn_BHXlqnKFJdJRf3host[waptrun]$ curl -X POST https://dev-80639559.okta.com/oauth2/default/v1/token -d grant_type=refresh_token -d client_id=$CLIENTID -d refresh_token=rCBVfBm2LBy4B0jbp3cmvP-oUAHpiP8aKhbloO61D7w
```

```
{"token_type":"Bearer","expires_in":3600,"access_token":"eyJraWQiOiJzX3BSVnZfZWs0Qlptbm00R3Q0OVlJeUNTcXVxTTBLUGRDZEtwZURwZXpVIiwiYWxnIjoiUlMyNTYifQ.eyJ2ZXIiOjEsImp0aSI6IkFULmx5N2NPZ2V5LThJelVnV1ZMbnJPTjZja3VXd0J5UzY3OF8zeHVFU1dpZnMub2FyYmg2YzVsMjFzUXF2V3k1ZDYiLCJpc3MiOiJodHRwczovL2Rldi04MDYzOTU1OS5va3RhLmNvbS9vYXV0aDIvZGVmYXVsdCIsImF1ZCI6ImFwaTovL2RlZmF1bHQiLCJpYXQiOjE2NDM2NjQyNTIsImV4cCI6MTY0MzY2Nzg1MiwiY2lkIjoiMG9hM3JuN3R6NzJIdFk5VjY1ZDciLCJ1aWQiOiIwMHUzcmxiZWFtcEJ0QjgyWDVkNyIsInNjcCI6WyJvZmZsaW5lX2FjY2VzcyIsInBob3RvcyJdLCJzdWIiOiJwY2RlcmljQGdtYWlsLmNvbSJ9.Y4tKTXaXHxEjqQjQbN1Yp1CWC0tDkdi8FAt64xC4KVgmUMXM7_uosMVycQ6mYyn7Zccvtneh3p-s3pI64ByhY2gTFW21RTc__GPjhHVwtRgT59GiXeNkfsDuwmB2i1W8m50jcZYWdtN9qFb7TGC6CS35D9B6uHLh8w1jCbat-cgtOHIni_ggaMQg5J5fxSHIH_iQ9T3x0hYOmSzVoINlyi6u7dQZxr9OeGSzwW5LIUr8CkfFsJ4USQT81Plnhg3-3VERfHXEHsQ1GNsX42VSYOjriJO0Fs7CS9BSuWN7dZspszi6L2373UW40w8wEknuyNGILkcAr7PhhK7H3bj4SA","scope":"offline_access photos","refresh_token":"rCBVfBm2LBy4B0jbp3cmvP-oUAHpiP8aKhbloO61D7w"}
```

### Exercise 4: OpenID Connect

Ref.: [Exercise 4: Getting user information with OpenID Connect](https://on24static.akamaized.net/event/35/17/92/6/rt/1/documents/resourceList1643415467137/exercise4gettinguserinformationwithopenidconnect1643415466819.pdf)

_Authorization Request_

```
https://dev-80639559.okta.com/oauth2/default/v1/authorize?response_type=code
    &scope=openid+email+profile+photos
    &client_id=0oa3rn7tz72HtY9V65d7
    &state=888444999333
    &redirect_uri=https://example-app.com/redirect
    &code_challenge=5Qd3esJXMwCPUAiV7saCh1KA3q1bC0Pku2mou2jyG70
    &code_challenge_method=S256
```

Redirected to : https://example-app.com/redirect?code=1AH25giruKGhBXuL444rz31o8Rb9wFJD9lYoqXOWF2c&state=888444999333

```
1AH25giruKGhBXuL444rz31o8Rb9wFJD9lYoqXOWF2c

```

## References

-   [OAuth.com](https://www.oauth.com/)
    -   [Intro to OAuth2 for Single Page Apps](https://www.oauth.com/oauth2-servers/single-page-apps/)
    -   [Signing-in to Google](https://www.oauth.com/oauth2-servers/signing-in-with-google/)
    -   [OAuth Playground](https://www.oauth.com/playground/index.html)
        -   [Auth Code with PKCE](https://www.oauth.com/playground/authorization-code-with-pkce.html)
-   [Okta Developer Docs](https://developer.okta.com/docs/reference/api/oidc/#response-properties-5)
    -   [OKta developer signup](https://developer.okta.com/signup/)
    -   [OIDC response properties](https://developer.okta.com/docs/reference/api/oidc/#response-properties-5)
    -   [Okta Getting Started](https://dev-80639559-admin.okta.com/admin/getting-started)
    -   [Okta Blog](https://developer.okta.com/blog/)
        -   [AuthJS with PKCE](https://developer.okta.com/blog/2019/08/22/okta-authjs-pkce)
-   [Okta Dev on Github](https://github.com/oktadev)
    -   [Code sample with okta-auth-js with Vue.JS and PKCE](https://github.com/oktadev/okta-auth-js-pkce-example)
-   [OAuth.net](https://oauth.net/)
    -   [OAuth.net: OAuth Code Flow](https://oauth.net/code/)
    -   [OAuth.net: OAuth School](https://oauth.school/)
    -   [OAuth.net: OAuth 2.0 Spec](https://oauth.net/2/)
    -   [OAuth.net: OAuth 2.1 Spec](https://oauth.net/2.1/)
    -   [Access Tokens](https://oauth.net/2/access-tokens/)
-   [IETF: OAuth Error Codes](https://datatracker.ietf.org/doc/html/rfc6750#section-3.1)
-   [Azure AD quickstart with OpenID Connect](https://github.com/AzureADQuickStarts/AppModelv2-WebApp-OpenIDConnect-nodejs/blob/master/config.js)
-   [OAuth 2.0 Auth Code Injection Attack in Action](https://www.youtube.com/watch?v=1ot45WwQWJE)
-   [Using service workers with OAuth](https://developer.forgerock.com/docs/platform/how-tos/building-identity-proxy-your-javascript-apps-using-service-worker)
-   [Okta on Youtube](https://www.youtube.com/oktadev)
-   [OAuth Simplified book](https://oauth2simplified.com/)
-   [NodeJS AppAuth](https://www.npmjs.com/package/@openid/appauth)
