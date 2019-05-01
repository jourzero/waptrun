const vals = require("./validationValues.js");

// NOTE: This input validation schema is only used for document updates and creations only. Checks/filters for other [targeted] operations are performed directly in the code.
module.exports = {
    issue: {
        PrjName: {
            matches: {options: vals.PrjName.matches},
            errorMessage: vals.PrjName.errorMessage
        },
        TID: {
            matches: {options: vals.TID.matches},
            errorMessage: vals.TID.errorMessage
        },
        TIssueName: {
            optional: true,
            isAscii: true,
            stripLow: {keep_new_lines: false},
            isLength: {options: {min: 5, max: 100}},
            errorMessage: "Expected: 5 to 100 characters.",
            trim: true
        },
        CweId: {
            optional: true,
            isInt: {options: vals.CweId.isInt},
            errorMessage: vals.CweId.errorMessage
        },
        TIssueBackground: {
            optional: true,
            isAscii: true,
            stripLow: {keep_new_lines: true},
            isLength: {options: {min: 0, max: 3000}},
            errorMessage: "Expected: 0 to 3000 characters.",
            trim: true
        },
        TRemediationBackground: {
            optional: true,
            isAscii: true,
            stripLow: {keep_new_lines: true},
            isLength: {options: {min: 0, max: 3000}},
            errorMessage: "Expected: 0 to 3000 characters.",
            trim: true
        },
        TSeverity: {
            optional: true,
            isInt: {options: {min: 0, max: 3}},
            errorMessage: "Expected: integer in the range [0-3]"
        },
        TRef1: {
            optional: true,
            matches: {options: vals.URL.matches},
            isLength: {options: {min: 0, max: 3000}},
            errorMessage: "Expected: URL with max 3000 characters",
            trim: true
        },
        TRef2: {
            optional: true,
            //isURL: {options: {require_tld: false, require_protocol: false, require_host: false}},
            matches: {options: vals.URL.matches},
            isLength: {options: {min: 0, max: 3000}},
            errorMessage: "Expected: URL with max 3000 characters",
            trim: true
        },
        TSeverityText: {
            optional: true,
            isAscii: true,
            stripLow: {keep_new_lines: false},
            trim: true
        },
        IURIs: {
            optional: true,
            isAscii: true,
            stripLow: {keep_new_lines: true},
            trim: true
        },
        IEvidence: {
            optional: true,
            isAscii: true,
            stripLow: {keep_new_lines: true},
            trim: true
        },
        IScreenshots: {
            optional: true,
            isAscii: true,
            stripLow: {keep_new_lines: true},
            trim: true
        },
        IPriority: {
            optional: true,
            isInt: {options: {min: -4, max: 3}},
            errorMessage: "Expected: integer in the range from -4 to 3]"
        },
        IPriorityText: {
            optional: true,
            isAscii: true,
            stripLow: {keep_new_lines: false},
            isLength: {options: {min: 0, max: 10}},
            trim: true
        },
        INotes: {
            optional: true,
            isAscii: true,
            stripLow: {keep_new_lines: true},
            trim: true
        }
    },
    project: {
        name: {
            matches: {options: vals.PrjName.matches},
            errorMessage: vals.PrjName.errorMessage
        },
        notes: {
            optional: true,
            isAscii: true,
            stripLow: {keep_new_lines: true},
            isLength: {options: {min: 0, max: 800}},
            trim: true
        },
        software: {
            optional: true,
            isAscii: true,
            stripLow: {keep_new_lines: true},
            isLength: {options: {min: 0, max: 400}},
            trim: true
        },
        scope: {
            optional: true,
            matches: {options: vals.scope.matches},
            errorMessage: vals.scope.errorMessage
        },
        scopeQry: {
            optional: true,
            matches: {options: vals.scopeQry.matches},
            errorMessage: vals.scopeQry.errorMessage
        },
        lastTID: {
            optional: true,
            matches: {options: vals.TID.matches},
            errorMessage: vals.TID.errorMessage,
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
            matches: {options: vals.TID.matches},
            errorMessage: vals.TID.errorMessage
        },
        TTestName: {
            optional: true,
            isAscii: true,
            stripLow: {keep_new_lines: false},
            isLength: {options: {min: 5, max: 80}},
            errorMessage: "Expected: 5 to 80 characters.",
            trim: true
        },
        TPhase: {
            optional: true,
            isAscii: true,
            stripLow: {keep_new_lines: false},
            isLength: {options: {min: 0, max: 40}},
            errorMessage: "Expected: 0 to 40 characters.",
            trim: true
        },
        TSection: {
            optional: true,
            isAscii: true,
            stripLow: {keep_new_lines: false},
            isLength: {options: {min: 0, max: 40}},
            errorMessage: "Expected: 0 to 40 characters.",
            trim: true
        },
        TSource: {
            optional: true,
            isAscii: true,
            stripLow: {keep_new_lines: false},
            isLength: {options: {min: 0, max: 40}},
            errorMessage: "Expected: 0 to 40 characters.",
            trim: true
        },
        TTesterSupport: {
            optional: true,
            isAscii: true,
            stripLow: {keep_new_lines: true},
            isLength: {options: {min: 0, max: 800}},
            trim: true
        },
        TTRef: {
            optional: true,
            matches: {options: vals.URL.matches},
            isLength: {options: {min: 0, max: 3000}},
            errorMessage: "Expected: URL with max 3000 characters",
            trim: true
        },
        TCweID: {
            optional: true,
            isNumeric: true
        },
        TIssueName: {
            optional: true,
            isAscii: true,
            stripLow: {keep_new_lines: false},
            isLength: {options: {min: 5, max: 100}},
            trim: true
        },
        TIssueBackground: {
            optional: true,
            isAscii: true,
            stripLow: {keep_new_lines: true},
            isLength: {options: {min: 0, max: 3000}},
            trim: true
        },
        TRemediationBackground: {
            optional: true,
            isAscii: true,
            stripLow: {keep_new_lines: true},
            isLength: {options: {min: 0, max: 3000}},
            trim: true
        },
        TSeverity: {
            optional: true,
            isInt: {options: {min: 0, max: 3}},
            errorMessage: "Expected: integer in the range [0-3]"
        },
        TIssueType: {
            optional: true,
            isAscii: true,
            stripLow: {keep_new_lines: false},
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
            matches: {options: vals.URL.matches},
            isLength: {options: {min: 0, max: 3000}},
            errorMessage: "Expected: URL with max 3000 characters",
            trim: true
        },
        TRef2: {
            optional: true,
            matches: {options: vals.URL.matches},
            isLength: {options: {min: 0, max: 3000}},
            errorMessage: "Expected: URL with max 3000 characters",
            trim: true
        }
    }
};
