"use strict";
const {Model} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class project extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    project.init(
        {
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            scope: {
                type: DataTypes.STRING,
            },
            scopeQry: {
                type: DataTypes.STRING,
            },
            TTestNameKeyword: {
                type: DataTypes.STRING,
            },
            TCweIDSearch: {
                type: DataTypes.INTEGER,
            },
            PciTests: {
                type: DataTypes.BOOLEAN,
            },
            Top10Tests: {
                type: DataTypes.BOOLEAN,
            },
            Top25Tests: {
                type: DataTypes.BOOLEAN,
            },
            StdTests: {
                type: DataTypes.BOOLEAN,
            },
            notes: {
                type: DataTypes.TEXT,
            },
            software: {
                type: DataTypes.STRING,
            },
        },
        {
            sequelize,
            modelName: "project",
        }
    );
    return project;
};
