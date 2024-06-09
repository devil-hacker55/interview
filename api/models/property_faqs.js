"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class property_faqs extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            property_faqs.belongsTo(models.properties, { onDelete: 'CASCADE' });
        }
    }
    property_faqs.init(
        {
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                allowNull: false,
                defaultValue: DataTypes.UUIDV4,
            },
            question: {
                type: DataTypes.STRING
                // required: true,
            },
            answer: {
                type: DataTypes.STRING
                // required: true,
            }
        },
        {
            sequelize,
            modelName: "property_faqs",
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
    return property_faqs;
};
