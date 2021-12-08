const logger = require("./lib/appLogger.js");
const { Op, Sequelize } = require("sequelize");

// Build filter for scope query
exports.getSequelizeScopeQuery = function (prj) {
    logger.debug(`Building scope query from scope query ${prj.scopeQry}`);
    let scopeQuery = {};
    let PciTests = prj.PciTests;
    let Top10Tests = prj.Top10Tests;
    let Top25Tests = prj.Top25Tests;
    let StdTests = prj.StdTests;
    let TTestNameKeyword = prj.TTestNameKeyword;
    let TCweIDSearch = prj.TCweIDSearch;

    // Build scope query
    switch (prj.scopeQry) {
        case "All":
            scopeQuery = {};
            break;
        case "API":
            scopeQuery = {
                [Op.or]: [
                    { TTestName: { [Op.like]: "API%" } },
                    { TTestName: { [Op.like]: "% API%" } },
                    { TTestName: { [Op.like]: "%REST%" } },
                    { TTestName: { [Op.like]: "%SOAP%" } },
                    { TTestName: { [Op.like]: "%AJAX%" } },
                    { TTestName: { [Op.like]: "%RPC%" } },
                    { TIssueName: { [Op.like]: "API%" } },
                    { TIssueName: { [Op.like]: "% API%" } },
                    { TSource: { [Op.like]: "%API%" } },
                ],
            };
            break;
        case "Default":
            scopeQuery = {
                [Op.or]: [{ TSource: "OWASP-WSTG" }, { TSource: "WAHH2" }, { TSource: "TBHM2015" }, { TSource: "Extras" }],
            };
            break;
        case "BCVRT":
        case "Extras":
        case "TBHM2015":
        case "OWASP-API-T10":
        case "OWASP-ASVS":
        case "OWASP-TG4":
        case "OWASP-WSTG":
        case "SEC542":
        case "SEC642":
        case "WAHH2":
        case "WebSvc":
        case "CWE-Top-25":
            scopeQuery = { TSource: prj.scopeQry };
        //scopeQuery = { $or: [ { TSource: prj.scopeQry }, { TSource: "Extras" }, ], };
    }

    let useTestNameKeyword = false;
    if (TTestNameKeyword !== undefined && TTestNameKeyword !== null && TTestNameKeyword.length > 0) useTestNameKeyword = true;

    let useTCweIDSearch = false;
    if (TCweIDSearch) useTCweIDSearch = true;

    if (PciTests || Top10Tests || Top25Tests || StdTests || useTestNameKeyword || useTCweIDSearch) {
        /*
        let filter = {};
        if (PciTests) filter = JSON.stringify(filter).length <= 2 ? { TPCI: PciTests } : { [Op.or]: [filter, { TPCI: PciTests }] };
        if (Top10Tests) filter = JSON.stringify(filter).length <= 2 ? { TTop10: Top10Tests } : { [Op.or]: [filter, { TTop10: Top10Tests }] };
        if (Top25Tests) filter = JSON.stringify(filter).length <= 2 ? { TTop25: Top25Tests } : { [Op.or]: [filter, { TTop25: Top25Tests }] };
        if (StdTests) filter = JSON.stringify(filter).length <= 2 ? { TStdTest: StdTests } : { [Op.or]: [filter, { TStdTest: StdTests }] };
        if (useTestNameKeyword) filter = JSON.stringify(filter).length <= 2 ? { TTestName: { [Op.like]: "%" + TTestNameKeyword + "%" } } : { $and: [filter, { TTestName: { [Op.like]: "%" + TTestNameKeyword + "%" } }] };
        if (useTCweIDSearch) filter = JSON.stringify(filter).length <= 2 ? { TCweID: TCweIDSearch } : { [Op.or]: [filter, { TCweID: TCweIDSearch }] };
        scopeQuery = { [Op.and]: [scopeQuery, filter] };
        */
        let filter = []
        filter.push(scopeQuery);

        if (PciTests) filter.push({ TPCI: true });
        if (Top10Tests) filter.push({ TTop10: true });
        if (Top25Tests) filter.push({ TTop25: true });
        if (StdTests) filter.push({ TStdTest: true });
        if (useTestNameKeyword) filter.push({ TTestName: { [Op.like]: "%" + TTestNameKeyword + "%" } });
        if (useTCweIDSearch) filter.push({ TCweID: TCweIDSearch });
        scopeQuery = { [Op.and]: filter };
    }
    return scopeQuery;
};
