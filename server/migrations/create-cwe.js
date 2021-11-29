"use strict";
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("cwes", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            CweID: {
                type: Sequelize.INTEGER,
                allowNull: false,
                unique: true,
            },
            Name: {
                type: Sequelize.STRING,
            },
            Weakness_Abstraction: {
                type: Sequelize.TEXT,
            },
            Status: {
                type: Sequelize.STRING,
            },
            Description_Summary: {
                type: Sequelize.TEXT,
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
        await queryInterface.dropTable("cwes");
    },
};
