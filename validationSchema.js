module.exports = {
    issue: {
        PrjName: {
            matches: {options: /^[0-9]{6,8}-[a-zA-Z0-9_]{2,20}-[a-zA-Z0-9_]{2,10}$/},
            errorMessage: "Expected: YYYYMM[DD]-PRJNAME-ENV (40 chars max.)"
        },
        TIssueName: {
            isAscii: true,
            isLength: {options: {min: 5, max: 100}},
            trim: true
        },
        TID: {
            matches: {options: /^[0-9a-zA-Z\-\.]{5,40}$/},
            errorMessage: "Expected: 5 to 40 alpha-numeric characters, dashes or dots."
        },
        CweId: {
            optional: true,
            isInt: {options: {min: 0, max: 9999}}
        },
        TIssueBackground: {
            optional: true,
            isLength: {options: {min: 0, max: 3000}},
            trim: true
        },
        TRemediationBackground: {
            optional: true,
            isLength: {options: {min: 0, max: 3000}},
            trim: true
        },
        TSeverity: {
            optional: true,
            isInt: {options: {min: 0, max: 3}}
        },
        TRef1: {
            optional: true,
            isURL: true,
            trim: true
        },
        TRef2: {
            optional: true,
            isURL: true,
            trim: true
        },
        TSeverityText: {
            optional: true,
            trim: true
        },
        IURIs: {
            optional: true,
            trim: true
        },
        IEvidence: {
            optional: true,
            trim: true
        },
        IScreenshots: {
            optional: true,
            trim: true
        },
        IPriority: {
            optional: true,
            isInt: {options: {min: -4, max: 3}}
        },
        IPriorityText: {
            optional: true,
            isLength: {options: {min: 0, max: 10}},
            trim: true
        },
        INotes: {
            optional: true,
            trim: true
        }
    },
    project: {
        name: {
            matches: {options: /^[0-9]{6,8}-[a-zA-Z0-9_]{2,20}-[a-zA-Z0-9_]{2,10}$/},
            errorMessage: "Expected: YYYYMM[DD]-PRJNAME-ENV (40 chars max.)"
        },
        notes: {
            optional: true,
            isLength: {options: {min: 0, max: 800}},
            trim: true
        },
        software: {
            optional: true,
            isLength: {options: {min: 0, max: 400}},
            trim: true
        },
        scope: {
            optional: true,
            matches: {options: /^[a-zA-Z0-9]{0,4}$/}
        },
        scopeQry: {
            optional: true,
            matches: {options: /^[a-zA-Z0-9\-]{0,10}$/}
        },
        lastTID: {
            optional: true,
            matches: {options: /^[0-9a-zA-Z\-\.]{5,40}$/},
            errorMessage: "Expected: 5 to 40 alpha-numeric characters, dashes or dots.",
            trim: true
        },
        PciTests: {
            optional: true,
            isBoolean: true
        },
        Top10Tests: {
            optional: true,
            isBoolean: true
        },
        Top25Tests: {
            optional: true,
            isBoolean: true
        },
        StdTests: {
            optional: true,
            isBoolean: true
        }
    },
    testKB: {
        TID: {
            matches: {options: /^[0-9a-zA-Z\-\.]{5,40}$/},
            errorMessage: "Expected: 5 to 40 alpha-numeric characters, dashes or dots."
        },
        TTestName: {
            isAscii: true,
            isLength: {options: {min: 5, max: 80}},
            errorMessage: "Expected: 5 to 80 characters.",
            trim: true
        },
        TPhase: {
            optional: true,
            isLength: {options: {min: 0, max: 40}},
            errorMessage: "Expected: 0 to 40 characters.",
            trim: true
        },
        TSection: {
            optional: true,
            isLength: {options: {min: 0, max: 40}},
            errorMessage: "Expected: 0 to 40 characters.",
            trim: true
        },
        TSource: {
            optional: true,
            isLength: {options: {min: 0, max: 40}},
            errorMessage: "Expected: 0 to 40 characters.",
            trim: true
        },
        TTesterSupport: {
            optional: true,
            isLength: {options: {min: 0, max: 800}},
            trim: true
        },
        TTRef: {
            optional: true,
            isURL: true,
            trim: true
        },
        TCweID: {
            optional: true,
            isNumeric: true
        },
        TIssueName: {
            isAscii: true,
            isLength: {options: {min: 5, max: 100}},
            trim: true
        },
        TIssueBackground: {
            optional: true,
            isLength: {options: {min: 0, max: 3000}},
            trim: true
        },
        TRemediationBackground: {
            optional: true,
            isLength: {options: {min: 0, max: 3000}},
            trim: true
        },
        TSeverity: {
            optional: true,
            isInt: {options: {min: 0, max: 3}}
        },
        TIssueType: {
            optional: true,
            isLength: {options: {min: 0, max: 100}},
            trim: true
        },
        TPCI: {
            optional: true,
            isBoolean: true
        },
        TTop10: {
            optional: true,
            isBoolean: true
        },
        TTop25: {
            optional: true,
            isBoolean: true
        },
        TStdTest: {
            optional: true,
            isBoolean: true
        },
        TRef1: {
            optional: true,
            isURL: true,
            trim: true
        },
        TRef2: {
            optional: true,
            isURL: true,
            trim: true
        }
    }
};
