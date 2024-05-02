"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class youtubes extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        
            youtubes.belongsTo(models.users);
        }
    }
    youtubes.init(
        {
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                allowNull: false,
                defaultValue: DataTypes.UUIDV4,
            },
            link: {
                type: DataTypes.STRING
                // required: true,
            },
        },
        {
            sequelize,
            modelName: "youtubes",
            // defaultScope: {
            //     // exclude password hash by default
            //     attributes: { exclude: ["password", "createdAt", "updatedAt"] },
            // },
            // scopes: {
            //     // include hash with this scope
            //     withHash: { attributes: {} },
            // },
        }
    );
    return youtubes;
};
