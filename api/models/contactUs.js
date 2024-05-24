"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class contactus extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
    
        }
    }
    contactus.init(
        {
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                allowNull: false,
                defaultValue: DataTypes.UUIDV4,
            },
            name: {
                type: DataTypes.STRING
                // required: true,
            },email: {
                type: DataTypes.STRING
                // required: true,
            },mobile: {
                type: DataTypes.STRING
                // required: true,
            },
            query: {
                type: DataTypes.STRING
                // required: true,
            },
            status: {
                type: DataTypes.ENUM("PENDING", "DONE", "REJECTED"),
                defaultValue: "PENDING",
            },
        },
        {
            sequelize,
            modelName: "contactus",
            // defaultScope: {
            //     // exclude password hash by default
            //     attributes: { exclude: ["password", "createdAt", "updatedAt"] },
            // },
            scopes: {
                // include hash with this scope
                withHash: { attributes: {} },
            },
        }
    );
    return contactus;
};
