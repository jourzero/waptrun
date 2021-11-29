"use strict";
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("projects", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
            },
            scope: {
                type: Sequelize.STRING,
            },
            scopeQry: {
                type: Sequelize.STRING,
            },
            TTestNameKeyword: {
                type: Sequelize.STRING,
            },
            TCweIDSearch: {
                type: Sequelize.INTEGER,
            },
            PciTests: {
                type: Sequelize.BOOLEAN,
            },
            Top10Tests: {
                type: Sequelize.BOOLEAN,
            },
            Top25Tests: {
                type: Sequelize.BOOLEAN,
            },
            StdTests: {
                type: Sequelize.BOOLEAN,
            },
            notes: {
                type: Sequelize.TEXT,
            },
            software: {
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
        await queryInterface.dropTable("projects");
    },
};
