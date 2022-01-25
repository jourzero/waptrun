// Configure your application and authorization server details
// Ref.: https://developers.google.com/identity/protocols/oauth2/openid-connect
var config = {
    client_id: "162295130053-af6mmqpj3dnua8rl5vdo7dg0gfn10cgi.apps.googleusercontent.com",
    authorization_endpoint: "https://accounts.google.com/o/oauth2/auth",
    token_endpoint: "https://oauth2.googleapis.com/token",
    requested_scopes: "openid email",
    //response_type: "code",
    response_type: "id_token",
    redirect_path: "/home",
};

// References:
// - https://www.oauth.com/playground/oidc.html
// - https://www.oauth.com/playground/implicit.html
// - https://www.websequencediagrams.com/cgi-bin/cdraw?lz=dGl0bGUgT0lEQyBMb2dpbiBTZXF1ZW5jZQojIGh0dHBzOi8vZGV2ZWxvcGVycy5nb29nbGUuY29tL2lkZW50aXR5L3Byb3RvY29scy9vYXV0aDIvb3BlbmlkLWNvbm5lY3QKYWN0b3IgQnJvd3NlcgoAAQcgLT4gQXBwOiBHZXQgbAB1BXBhZ2VcbgBtCDxhcHA-LwAVBQpub3RlIHJpZ2h0IG9mAC8IbmVyYXRlIHN0YXRlIGFuZCBub25jZQpBcHAgLS0-AGgIOiAoQVMtVVJJKQoAbwwrQVM6IENsaWNrIFNpZ25pbiB0byBHAIFYBSAoYXV0aC4gcmVxdWVzdClcbgA7BjoAggcJPGFzPi9hdXRob3JpemU_KGNsaWVudF9pZCwgc2NvcGU9IgCBfAYgZW1haWwgcHJvZmlsZSIiLACBJwYsAIEkBi4uLikAggUJPC0tPiBBUzogQXV0aGVudGljACQFZ2l2ZSBjb25zZW50CkFTAIFUBS0AgVEJUmVkaXJlY3QgdG8gY2FsbGJhY2sAgkEFIChjb2RlAGgHAIFrDgCCbwVTZW5kIGNvZACCXhEAPgg_ADsGADkHAIJsE0NoZWNrIGFudGktZm9yZ2VyeQCDAwYAgnkGAIFFBkV4Y2hhbmdlAGUFIGZvciB0b2tlbgCBFAllY3JldCkAgU8IAIQIBSgAHQUAghoHLACCMggAbRVWYWxpZGF0ZQBPBgCDZBMAaAUAgS0QAIQNCVNhdgA0ByB0byBzZXNzaW9uIHN0b3JhZ2UKCmFsdCBTaW5nbGUgUGFnZSBBcHAAgl4FcyBBUEkgd2l0aCBiZWFyZQCBTQcAhE0OUEk6IENhbGwgQVBJAIVBEGFwaS88ZW5kcG9pbnQ-XG4oQQCEQQdhdGlvbiBoZWFkZXIATxIAgn4HbGVmAIV9BlBJAIFyECxcbmMAgxAFdXNlciBhY2Nlc3NcbmFuZCBwcm9jZXNzAIVJCApBUEkAhhMPSlNPTiByZXNwb25zZSkKZW5kCgoK&s=modern-blue
// - https://developer.okta.com/blog/2019/05/01/is-the-oauth-implicit-flow-dead
// - https://developers.google.com/identity/protocols/oauth2/openid-connect
// - https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow?hl=en
