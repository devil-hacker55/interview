'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class useraddresses extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            //M:M roles can have many permissions and permissions can have many roles
            useraddresses.belongsTo(models.users, { onDelete: 'CASCADE' })
            useraddresses.belongsTo(models.properties, { onDelete: 'CASCADE' })
        }
    };
    useraddresses.init({
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4,
        },
        isprimary: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        homeno: DataTypes.STRING(15),
        pincode: DataTypes.STRING(15),
        isprimary: DataTypes.BOOLEAN,
        address: DataTypes.STRING,
        city: DataTypes.STRING(30),
        district: DataTypes.STRING(30),
        landmark: DataTypes.STRING(30),
        state: DataTypes.STRING(20),
        country: DataTypes.STRING(20),
        map_link: DataTypes.STRING,
        locality: DataTypes.STRING,
    }, {
        sequelize,
        modelName: 'useraddresses',
        defaultScope: {
            // exclude password hash by default
            attributes: { exclude: ['createdAt', 'updatedAt'] }
        },
        scopes: {
            // include hash with this scope
            withHash: { attributes: {}, },
        },
    });
    return useraddresses;
};