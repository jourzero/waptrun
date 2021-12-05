"use strict";
const {Model} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class issue extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    issue.init(
        {
            PrjName: {
                type: DataTypes.STRING,
                unique: "issue_unique",
                allowNull: false,
            },
            TID: {
                type: DataTypes.STRING,
                unique: "issue_unique",
                allowNull: false,
            },
            TIssueName: {
                type: DataTypes.STRING,
            },
            CweId: {
                type: DataTypes.INTEGER,
            },
            IURIs: {
                type: DataTypes.TEXT,
            },
            IEvidence: {
                type: DataTypes.TEXT,
            },
            IScreenshots: {
                type: DataTypes.TEXT,
            },
            IPriority: {
                type: DataTypes.INTEGER,
            },
            IPriorityText: {
                type: DataTypes.STRING,
            },
            INotes: {
                type: DataTypes.TEXT,
            },
        },
        {
            sequelize,
            modelName: "issue",
            indexes: [{unique: true, name: "issue_unique", fields: ["PrjName", "TID"]}],
        }
    );
    return issue;
};
