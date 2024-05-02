'use strict';
const {
    Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {

    class property_visits extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            property_visits.belongsTo(models.properties, { onDelete: 'CASCADE' });
            property_visits.belongsTo(models.users, { onDelete: 'CASCADE' });
        }
    };
    property_visits.init({
        contactedAt: {
            type: DataTypes.DATE,
            required: true
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        status: {
            type: DataTypes.ENUM("PENDING", "REJECTED", "DONE")
        },
        count: {
            type: DataTypes.INTEGER
        },


    }, {
        sequelize,
        modelName: 'property_visits',
        defaultScope: {
            // exclude password hash by default
            attributes: { exclude: ['createdAt', 'updatedAt'] }
        },
    })

    return property_visits;
};
