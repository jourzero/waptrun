"use strict";
//==========================================================================
// Description Seeder for sequelized data
// How to use:
//    ../node_modules/.bin/sequelize db:seed:all --debug
//    ../node_modules/.bin/sequelize db:seed --debug --seed <<NAME>>-seeder
//==========================================================================
const fs = require("fs");
const coll = "test";
const tableName = "tests";
const jsonDir = "/app/backup/json/";
const jsonFile = jsonDir + coll + ".json";

module.exports = {
    up: (queryInterface, Sequelize) => {
        let data = [];
        let filedata = fs.readFileSync(jsonFile);
        let old_data = JSON.parse("[" + filedata + "]");
        // Just keep specific attributes from original CWE data
        for (let el of old_data) {
            let o = {};
            o.TID = el.TID;
            o.TTestName = el.TTestName;
            o.TSource = el.TSource;
            o.TTesterSupport = el.TTesterSupport;
            o.TTRef = el.TTRef;
            o.TCweID = el.TCweID;
            o.TIssueName = el.TIssueName;
            o.TIssueBackground = el.TIssueBackground;
            o.TRemediationBackground = el.TRemediationBackground;
            o.TSeverity = el.TSeverity;
            o.TSeverityText = el.TSeverityText;
            o.TPCI = el.TPCI;
            o.TTop10 = el.TTop10;
            o.TTop25 = el.TTop25;
            o.TStdTest = el.TStdTest;
            o.TRef1 = el.TRef1;
            o.TRef2 = el.TRef2;
            o.createdAt = new Date().toDateString();
            o.updatedAt = new Date().toDateString();
            data.push(o);
        }
        console.debug(`JSON data: ${JSON.stringify(data)}`);
        return queryInterface.bulkInsert(tableName, data, {});
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete(tableName, null, {});
    },
};
