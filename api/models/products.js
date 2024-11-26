'use strict';
const {
    Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {

    class products extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {

        }
    };
    products.init({
        // contactedAt: {
        //     type: DataTypes.DATE,
        //     required: true
        // },
        // isActive: {
        //     type: DataTypes.BOOLEAN,
        //     defaultValue: true,
        // },
        // count: {
        //     type: DataTypes.INTEGER
        // },
        productId: {
            type: DataTypes.STRING
        },
        productName: {
            type: DataTypes.STRING
        },
        description: {
            type: DataTypes.STRING
        },
        price: {
            type: DataTypes.STRING
        },
        currency: {
            type: DataTypes.STRING
        },
        category: {
            type: DataTypes.STRING
        },
        subCategory: {
            type: DataTypes.STRING
        },
        productCode: {
            type: DataTypes.STRING
        },
        productType: {
            type: DataTypes.STRING
        },
        images: {
            type: DataTypes.STRING
        },
        imagesUrl: {
            type: DataTypes.STRING
        },
        moreDetails: {
            type: DataTypes.STRING
        },
        features: {
            type: DataTypes.STRING
        },
        benefits: {
            type: DataTypes.STRING
        },
        specifications: {
            type: DataTypes.STRING
        },
        organizationId: {
            type: DataTypes.STRING
        },
        status: {
            type: DataTypes.STRING
        },
        
        brandName: {
            type: DataTypes.STRING
        },
        pricingType: {
            type: DataTypes.STRING
        },
        discount: {
            type: DataTypes.STRING
        },
        stock: {
            type: DataTypes.STRING
        },
        sku: {
            type: DataTypes.STRING
        },
        availableInCountries: {
            type: DataTypes.STRING
        },
        verifiedStatus: {
            type: DataTypes.STRING
        },


    }, {
        sequelize,
        modelName: 'products',
        // defaultScope: {
        //     // exclude password hash by default
        //     attributes: { exclude: ['createdAt', 'updatedAt'] }
        // },
    })

    return products;
};
