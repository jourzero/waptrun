"use strict";
//==========================================================================
// Description Seeder for sequelized data
// How to use:
//    ../node_modules/.bin/sequelize db:seed:all --debug
//    ../node_modules/.bin/sequelize db:seed --debug --seed <<NAME>>-seeder
//==========================================================================
const fs = require("fs");
const coll = "issue";
const tableName = "issues";
const jsonDir = "/app/backup/json/";
const jsonFile = jsonDir + coll + ".json";

module.exports = {
    up: (queryInterface, Sequelize) => {
        let data = [];
        let filedata = fs.readFileSync(jsonFile);
        let olddata = JSON.parse("[" + filedata + "]");
        for (let el of olddata) {
            let o = {};
            o.PrjName = el.PrjName;
            o.TID = el.TID;
            o.TIssueName = el.TIssueName;
            o.CweId = el.CweId;
            o.IURIs = el.IURIs;
            o.IEvidence = el.IEvidence;
            o.IScreenshots = el.IScreenshots;
            o.IURIs = "";
            o.IEvidence = "";
            o.IScreenshots = "";
            o.IPriority = el.IPriority;
            o.IPriorityText = el.IPriorityText;
            o.INotes = el.INotes;
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
