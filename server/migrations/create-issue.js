"use strict";
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("issues", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            PrjName: {
                type: Sequelize.STRING,
                unique: "compositeIndex",
                allowNull: false,
            },
            TID: {
                type: Sequelize.STRING,
                unique: "compositeIndex",
                allowNull: false,
            },
            TIssueName: {
                type: Sequelize.STRING,
            },
            CweId: {
                type: Sequelize.INTEGER,
            },
            IURIs: {
                type: Sequelize.TEXT,
            },
            IEvidence: {
                type: Sequelize.TEXT,
            },
            IScreenshots: {
                type: Sequelize.TEXT,
            },
            IPriority: {
                type: Sequelize.INTEGER,
            },
            IPriorityText: {
                type: Sequelize.STRING,
            },
            INotes: {
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
        await queryInterface.dropTable("issues");
    },
};
