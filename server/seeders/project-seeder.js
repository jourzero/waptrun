"use strict";
//==========================================================================
// Description Seeder for sequelized data
// How to use:
//    ../node_modules/.bin/sequelize db:seed:all --debug
//    ../node_modules/.bin/sequelize db:seed --debug --seed <<NAME>>-seeder
//==========================================================================
const fs = require("fs");
const coll = "project";
const tableName = "projects";
const jsonDir = "/app/backup/json/";
const jsonFile = jsonDir + coll + ".json";

module.exports = {
    up: (queryInterface, Sequelize) => {
        let data = [];
        let filedata = fs.readFileSync(jsonFile);
        data = JSON.parse("[" + filedata + "]");
        for (let el of data) {
            delete el["_id"];
            el.createdAt = new Date().toDateString();
            el.updatedAt = new Date().toDateString();
        }
        console.debug(`JSON data: ${JSON.stringify(data)}`);
        return queryInterface.bulkInsert(tableName, data, {});
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete(tableName, null, {});
    },
};
