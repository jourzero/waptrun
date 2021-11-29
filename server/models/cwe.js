"use strict";
const {Model} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class cwe extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    cwe.init(
        {
            CweID: {
                type: DataTypes.INTEGER,
                allowNull: false,
                unique: true,
            },
            Name: {
                type: DataTypes.STRING,
            },
            Weakness_Abstraction: {
                type: DataTypes.TEXT,
            },
            Status: {
                type: DataTypes.STRING,
            },
            Description_Summary: {
                type: DataTypes.TEXT,
            },
        },
        {
            sequelize,
            modelName: "cwe",
        }
    );
    return cwe;
};
