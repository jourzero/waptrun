const vals = require("./validationValues.js");

// NOTE: This input validation schema is only used for document updates and creations only. Checks/filters for other [targeted] operations are performed directly in the code.
module.exports = {
    issue: {
        PrjName: {
            matches: { options: vals.PrjName.matches },
            errorMessage: vals.PrjName.errorMessage,
        },
        TID: {
            matches: { options: vals.TID.matches },
            errorMessage: vals.TID.errorMessage,
        },
        TIssueName: {
            optional: true,
            matches: { options: vals.Singleline.matches },
            errorMessage: vals.Singleline.errorMessage,
            trim: true,
        },
        CweId: {
            optional: true,
            isInt: { options: vals.CweId.isInt },
            errorMessage: vals.CweId.errorMessage,
        },
        TIssueBackground: {
            optional: true,
            matches: { options: vals.Multiline.matches },
            errorMessage: vals.Multiline.errorMessage,
            trim: true,
        },
        TRemediationBackground: {
            optional: true,
            matches: { options: vals.Multiline.matches },
            errorMessage: vals.Multiline.errorMessage,
            trim: true,
        },
        TSeverity: {
            optional: true,
            isInt: { options: { min: 0, max: 3 } },
            errorMessage: "Expected: integer in the range [0-3]",
        },
        TRef1: {
            optional: true,
            matches: { options: vals.URL.matches },
            isLength: { options: { min: 0, max: 20000 } },
            errorMessage: "Expected: URL with max 20000 characters",
            trim: true,
        },
        TRef2: {
            optional: true,
            //isURL: {options: {require_tld: false, require_protocol: false, require_host: false}},
            matches: { options: vals.URL.matches },
            isLength: { options: { min: 0, max: 20000 } },
            errorMessage: "Expected: URL with max 20000 characters",
            trim: true,
        },
        TSeverityText: {
            optional: true,
            isAlpha: { locale: "en-US" },
            errorMessage: "Expected: severity text: Info , Low, Medium, High",
            trim: true,
        },
        IURIs: {
            optional: true,
            matches: { options: vals.MultilineURIs.matches },
            errorMessage: vals.MultilineURIs.errorMessage,
            trim: true,
        },
        IEvidence: {
            optional: true,
            matches: { options: vals.Multiline.matches },
            errorMessage: vals.Multiline.errorMessage,
            trim: true,
        },
        IScreenshots: {
            optional: true,
            matches: { options: vals.Multiline.matches },
            errorMessage: vals.Multiline.errorMessage,
            trim: true,
        },
        IPriority: {
            optional: true,
            isInt: { options: { min: -4, max: 3 } },
            errorMessage: "Expected: integer in the range from -4 to 3]",
        },
        IPriorityText: {
            optional: true,
            isAlpha: { locale: "en-US" },
            isLength: { options: { min: 0, max: 10 } },
            errorMessage:
                "Expected: priority text: Info , Low, Medium, High, Tested, Fixed, TODO, Exclude",
            trim: true,
        },
        INotes: {
            optional: true,
            matches: { options: vals.Multiline.matches },
            errorMessage: vals.Multiline.errorMessage,
            trim: true,
        },
    },
    project: {
        name: {
            matches: { options: vals.PrjName.matches },
            errorMessage: vals.PrjName.errorMessage,
        },
        notes: {
            optional: true,
            matches: { options: vals.Multiline.matches },
            errorMessage: vals.Multiline.errorMessage,
            trim: true,
        },
        software: {
            optional: true,
            matches: { options: vals.Multiline.matches },
            errorMessage: vals.Multiline.errorMessage,
            trim: true,
        },
        TTestNameKeyword: {
            matches: { options: vals.TTestNameKeyword.matches },
            errorMessage: vals.TTestNameKeyword.errorMessage,
        },
        scope: {
            optional: true,
            matches: { options: vals.scope.matches },
            errorMessage: vals.scope.errorMessage,
        },
        scopeQry: {
            optional: true,
            matches: { options: vals.scopeQry.matches },
            errorMessage: vals.scopeQry.errorMessage,
        },
        lastTID: {
            optional: true,
            matches: { options: vals.TID.matches },
            errorMessage: vals.TID.errorMessage,
            trim: true,
        },
        PciTests: {
            optional: true,
            isBoolean: true,
            errorMessage: "Expected: Boolean value (true or false)",
        },
        Top10Tests: {
            optional: true,
            isBoolean: true,
            errorMessage: "Expected: Boolean value (true or false)",
        },
        Top25Tests: {
            optional: true,
            isBoolean: true,
            errorMessage: "Expected: Boolean value (true or false)",
        },
        StdTests: {
            optional: true,
            isBoolean: true,
            errorMessage: "Expected: Boolean value (true or false)",
        },
    },
    testKB: {
        TID: {
            matches: { options: vals.TID.matches },
            errorMessage: vals.TID.errorMessage,
        },
        TTestName: {
            optional: true,
            matches: { options: vals.Singleline.matches },
            errorMessage: vals.Singleline.errorMessage,
            trim: true,
        },
        TPhase: {
            optional: true,
            matches: { options: vals.Singleline.matches },
            errorMessage: vals.Singleline.errorMessage,
            trim: true,
        },
        TSection: {
            optional: true,
            matches: { options: vals.Singleline.matches },
            errorMessage: vals.Singleline.errorMessage,
            trim: true,
        },
        TSource: {
            optional: true,
            matches: { options: vals.Singleline.matches },
            errorMessage: vals.Singleline.errorMessage,
            trim: true,
        },
        TTesterSupport: {
            optional: true,
            matches: { options: vals.Multiline.matches },
            errorMessage: vals.Multiline.errorMessage,
            trim: true,
        },
        TTRef: {
            optional: true,
            matches: { options: vals.URL.matches },
            isLength: { options: { min: 0, max: 20000 } },
            errorMessage: "Expected: URL with max 20000 characters",
            trim: true,
        },
        TCweID: {
            optional: true,
            isInt: { options: vals.CweId.isInt },
            errorMessage: vals.CweId.errorMessage,
        },
        TIssueName: {
            optional: true,
            matches: { options: vals.Singleline.matches },
            errorMessage: vals.Singleline.errorMessage,
            trim: true,
        },
        TIssueBackground: {
            optional: true,
            matches: { options: vals.Multiline.matches },
            errorMessage: vals.Multiline.errorMessage,
            trim: true,
        },
        TRemediationBackground: {
            optional: true,
            matches: { options: vals.Multiline.matches },
            errorMessage: vals.Multiline.errorMessage,
            trim: true,
        },
        TSeverity: {
            optional: true,
            isInt: { options: { min: 0, max: 3 } },
            errorMessage: "Expected: integer in the range [0-3]",
        },
        TIssueType: {
            optional: true,
            matches: { options: vals.Singleline.matches },
            errorMessage: vals.Singleline.errorMessage,
            trim: true,
        },
        TPCI: {
            optional: true,
            isBoolean: true,
            errorMessage: "Expected: Boolean value (true or false).",
        },
        TTop10: {
            optional: true,
            isBoolean: true,
            errorMessage: "Expected: Boolean value (true or false).",
        },
        TTop25: {
            optional: true,
            isBoolean: true,
            errorMessage: "Expected: Boolean value (true or false).",
        },
        TStdTest: {
            optional: true,
            isBoolean: true,
            errorMessage: "Expected: Boolean value (true or false).",
        },
        TRef1: {
            optional: true,
            matches: { options: vals.URL.matches },
            isLength: { options: { min: 0, max: 20000 } },
            errorMessage: "Expected: URL with max 20000 characters",
            trim: true,
        },
        TRef2: {
            optional: true,
            matches: { options: vals.URL.matches },
            isLength: { options: { min: 0, max: 20000 } },
            errorMessage: "Expected: URL with max 20000 characters",
            trim: true,
        },
    },
};
