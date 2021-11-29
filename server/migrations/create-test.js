"use strict";
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("tests", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            TID: {
                type: Sequelize.STRING,
                unique: true,
                allowNull: false,
            },
            TTestName: {
                type: Sequelize.STRING,
            },
            TSource: {
                type: Sequelize.STRING,
            },
            TTesterSupport: {
                type: Sequelize.TEXT,
            },
            TTRef: {
                type: Sequelize.STRING,
            },
            TCweID: {
                type: Sequelize.STRING,
            },
            TIssueName: {
                type: Sequelize.STRING,
            },
            TIssueBackground: {
                type: Sequelize.TEXT,
            },
            TRemediationBackground: {
                type: Sequelize.TEXT,
            },
            TSeverity: {
                type: Sequelize.INTEGER,
            },
            TSeverityText: {
                type: Sequelize.STRING,
            },
            TPCI: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            },
            TTop10: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            },
            TTop25: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            },
            TStdTest: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            },
            TRef1: {
                type: Sequelize.STRING,
            },
            TRef2: {
                type: Sequelize.STRING,
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable("tests");
    },
};
