'use strict';
const {
    Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {

    class likes extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            likes.belongsTo(models.properties, { onDelete: 'CASCADE' });
            likes.belongsTo(models.users, { onDelete: 'CASCADE' });
        }
    };
    likes.init({
        contactedAt: {
            type: DataTypes.DATE,
            required: true
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        count: {
            type: DataTypes.INTEGER
        },


    }, {
        sequelize,
        modelName: 'likes',
        defaultScope: {
            // exclude password hash by default
            attributes: { exclude: ['createdAt', 'updatedAt'] }
        },
    })

    return likes;
};
