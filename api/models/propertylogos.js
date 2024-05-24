"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class propertylogos extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
    
        }
    }
    propertylogos.init(
        {
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                allowNull: false,
                defaultValue: DataTypes.UUIDV4,
            },
            key: {
                type: DataTypes.STRING
                // required: true,
            },value: {
                type: DataTypes.STRING
                // required: true,
            }
            ,heading: {
                type: DataTypes.STRING
                // required: true,
            }
        },
        {
            sequelize,
            modelName: "propertylogos",
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
    return propertylogos;
};
