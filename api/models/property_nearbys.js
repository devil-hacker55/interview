"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class property_nearbys extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            property_nearbys.belongsTo(models.properties, { onDelete: 'CASCADE' });
        }
    }
    property_nearbys.init(
        {
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                allowNull: false,
                defaultValue: DataTypes.UUIDV4,
            },
            type: {
                type: DataTypes.ENUM("HOSPITAL", "SCHOOL", "AIRPORT", "BUS", "RESTAURANTS", "SHOPPING", "BANKS", "CINEMAS",)
                // required: true,
            },
            text: {
                type: DataTypes.STRING
                // required: true,
            }
        },
        {
            sequelize,
            modelName: "property_nearbys",
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
    return property_nearbys;
};
