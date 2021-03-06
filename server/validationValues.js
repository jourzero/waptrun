module.exports = {
    PrjName: {
        matches: /^[0-9]{6,8}-[a-zA-Z0-9_]{2,20}-[a-zA-Z0-9_]{2,10}$/,
        errorMessage:
            "Expected: YYYYMM[DD]-PRJNAME-ENV (40 max., alpha-num., underscores)",
    },
    TID: {
        matches: /^[0-9a-zA-Z\-\.]{0,40}$/,
        errorMessage:
            "Expected: 0 to 40 alpha-numeric characters, dashes or dots",
    },
    TTestNameKeyword: {
        matches: /^[0-9a-zA-Z\-\.\ ]{0,20}$/,
        errorMessage:
            "Expected: 0 to 20 alpha-numeric characters, space, dashes or dots",
    },
    TCweIDSearch: {
        isInt: { min: 0, max: 9999 },
        errorMessage: "Expected: integer in the range [0-9999]",
    },
    scope: {
        matches: /^[a-zA-Z0-9]{0,4}$/,
        errorMessage: "Expected: 0 to 4 alpha-numeric characters",
    },
    scopeQry: {
        matches: /^[a-zA-Z0-9\-]{0,15}$/,
        errorMessage:
            "Expected: 0 to 15 alpha-numeric characters, dash accepted",
    },
    CweId: {
        isInt: { min: 0, max: 9999 },
        errorMessage: "Expected: integer in the range [0-9999]",
    },
    URL: {
        matches: /^(((https?:\/\/)?([-a-zA-Z0-9@:._]{2,256})\/?([-a-zA-Z0-9@:%_\+.~#?&/=()]*))|())?$/,
        errorMessage:
            "Expected: URL in the form http[s]://FQDN[:PORT]/PATH/FILENAME?PARM1=VAL1&PARM2=VAL2",
    },
    Singleline: {
        matches: /^[\x20-\x7e]{0,200}$/,
        errorMessage: "Expected: 0 to 200 printable charachers",
    },
    Multiline: {
        matches: /^[\x20-\x7e\r\n]{0,20000}$/m,
        errorMessage: "Expected: 0 to 20000 printable charachers",
    },
    MultilineURIs: {
        matches: /^[-a-zA-Z0-9@:._@:%_\+.~#?&/=()!;\n]{0,20000}$/,
        errorMessage: "Expected: 0 to 20000 characters of multiline URIs",
    },
};
