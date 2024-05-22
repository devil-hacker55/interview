"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class bookmeets extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        
            bookmeets.belongsTo(models.users, { onDelete: "CASCADE" });
            bookmeets.belongsTo(models.properties);
        }
    }
    bookmeets.init(
        {
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                allowNull: false,
                defaultValue: DataTypes.UUIDV4,
            },
            purpose: {
                type: DataTypes.ENUM("ZOOM", "CAB","BROCHURE"),
                // required: true,
            },
            status: {
                type: DataTypes.ENUM("PENDING", "DONE", "REJECTED"),
                // required: true,
            },
        },
        {
            sequelize,
            modelName: "bookmeets",
            defaultScope: {
                // exclude password hash by default
                attributes: { exclude: ["password", "createdAt", "updatedAt"] },
            },
            scopes: {
                // include hash with this scope
                withHash: { attributes: {} },
            },
        }
    );
    return bookmeets;
};
