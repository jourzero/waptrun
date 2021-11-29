"use strict";
const {Model} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class test extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    test.init(
        {
            TID: {
                type: DataTypes.STRING,
                unique: true,
                allowNull: false,
            },
            TTestName: {
                type: DataTypes.STRING,
            },
            TSource: {
                type: DataTypes.STRING,
            },
            TTesterSupport: {
                type: DataTypes.TEXT,
            },
            TTRef: {
                type: DataTypes.STRING,
            },
            TCweID: {
                type: DataTypes.STRING,
            },
            TIssueName: {
                type: DataTypes.STRING,
            },
            TIssueBackground: {
                type: DataTypes.TEXT,
            },
            TRemediationBackground: {
                type: DataTypes.TEXT,
            },
            TSeverity: {
                type: DataTypes.INTEGER,
            },
            TSeverityText: {
                type: DataTypes.STRING,
            },
            TPCI: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            TTop10: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            TTop25: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            TStdTest: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            TRef1: {
                type: DataTypes.STRING,
            },
            TRef2: {
                type: DataTypes.STRING,
            },
        },
        {
            sequelize,
            modelName: "test",
        }
    );
    return test;
};
