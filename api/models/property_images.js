'use strict';
const {
    Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {

    class property_images extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            property_images.belongsTo(models.properties, { onDelete: 'CASCADE' });
        }
    };
    property_images.init({
        productImage: {
            type: DataTypes.STRING,
            required: true
        },

    }, {
        sequelize,
        modelName: 'property_images',
        defaultScope: {
            // exclude password hash by default
            attributes: { exclude: ['createdAt', 'updatedAt'] }
        },
    })

    return property_images;
};
