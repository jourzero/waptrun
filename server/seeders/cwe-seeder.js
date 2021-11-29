"use strict";
//==========================================================================
// Description Seeder for sequelized data
// How to use:
//    ../node_modules/.bin/sequelize db:seed:all --debug
//    ../node_modules/.bin/sequelize db:seed --debug --seed <<NAME>>-seeder
//==========================================================================
const fs = require("fs");
const coll = "cwe";
const tableName = "cwes";
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
            o.CweID = el.CweID;
            o.Name = el.Name;
            o.Weakness_Abstraction = el.Weakness_Abstraction;
            o.Status = el.Status;
            o.Description_Summary = el.Description_Summary;
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
