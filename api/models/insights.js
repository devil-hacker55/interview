'use strict';
const {
    Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {

    class insights extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            insights.belongsTo(models.users, { onDelete: 'CASCADE' });
        }
    };
    insights.init({
        description: {
            type: DataTypes.TEXT,
            required: true
        },  
        image: {
            type: DataTypes.STRING,
        },
        title: {
            type: DataTypes.STRING
        },


    }, {
        sequelize,
        modelName: 'insights',
        defaultScope: {
            // exclude password hash by default
            attributes: { exclude: ['createdAt', 'updatedAt'] }
        },
    })

    return insights;
};
