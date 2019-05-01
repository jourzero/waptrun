module.exports = {
    PrjName: {
        matches: /^[0-9]{6,8}-[a-zA-Z0-9_]{2,20}-[a-zA-Z0-9_]{2,10}$/,
        errorMessage:
            "Expected: YYYYMM[DD]-PRJNAME-ENV (40 max., alpha-numeric, underscore accepted)"
    },
    TID: {
        matches: /^[0-9a-zA-Z\-\.]{0,40}$/,
        errorMessage: "Expected: 0 to 40 alpha-numeric characters, dashes or dots"
    },
    scope: {
        matches: /^[a-zA-Z0-9]{0,4}$/,
        errorMessage: "Expected: 0 to 4 alpha-numeric characters"
    },
    scopeQry: {
        matches: /^[a-zA-Z0-9\-]{0,10}$/,
        errorMessage: "Expected: 0 to 10 alpha-numeric characters, dash accepted"
    },
    CweId: {
        isInt: {min: 0, max: 9999},
        errorMessage: "Expected: integer in the range [0-9999]"
    },
    URL: {
        matches: /^(((https?:\/\/)?([-a-zA-Z0-9@:._]{2,256})\/?([-a-zA-Z0-9@:%_\+.~#?&/=()]*))|())?$/
    }
};
