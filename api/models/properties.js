"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class properties extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            //properties.hasOne(models.clients);
            properties.hasOne(models.useraddresses, { onDelete: 'CASCADE' });

            properties.hasMany(models.refreshTokens, { onDelete: "CASCADE" });
            properties.hasMany(models.property_images, { onDelete: 'CASCADE' });
            properties.hasMany(models.property_visits, { onDelete: 'CASCADE' });
            properties.hasMany(models.likes, { onDelete: 'CASCADE' });
            properties.hasMany(models.bookmeets, { onDelete: 'CASCADE' });
            // properties.hasMany(models.properties, {
            //     foreignKey: "parentId",
            //     targetKey: "id",
            //     as: "childs",
            // });
            // properties.belongsTo(models.properties, {
            //     foreignKey: "parentId",
            //     targetKey: "id",
            //     as: "parent",
            // });
            properties.belongsTo(models.categories)
            properties.belongsTo(models.users)
            //features
        }
    }
    properties.init(
        {
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                allowNull: false,
                defaultValue: DataTypes.UUIDV4,
            },
            propertyName: {
                type: DataTypes.STRING,
                required: true,
            },
            purpose: {
                type: DataTypes.ENUM("SELL", "RENT"),
                // required: true,
            },
            admin_status: {
                type: DataTypes.ENUM("PENDING", "ACCEPTED", "REJECTED"),
                // required: true,
            },
            propertyStatus: {
                type: DataTypes.ENUM("UNDERCONSTRUCTION", "READY", "RESALE"),
                // required: true,
            },
            propertyType: {
                type: DataTypes.ENUM("NEW", "RESALE"),
                // required: true,
            },
            roomType: {
                type: DataTypes.ENUM("1 RK", "1 BHK", "2 BHK", "3 BHK", "3.5 BHK", "4 BHK", "4.5 BHK", "5 BHK", "5+ BHK"),
            },
            lattitude: {
                type: DataTypes.STRING,
            },
            longitutde: {
                type: DataTypes.STRING,
            },
            no_of_balconies: DataTypes.STRING,
            No_of_bathrooms: DataTypes.STRING,
            additional_rooms: DataTypes.STRING,
            rentPrice:DataTypes.DOUBLE,
            depositAmount:DataTypes.DOUBLE,
            facing: {
                type: DataTypes.ENUM("WEST", "EAST", "NORTH"),
                // required: true,
            },
            ownership: {
                type: DataTypes.ENUM("FREEHOLD", "LEASEHOLD", "POWEROFATTORNEY"),
                // required: true,
            },
            floor: DataTypes.STRING,
            furnishing: {
                type: DataTypes.ENUM("FURNISHED", "UNFURNISHED", "SEMIFURNISHED"),
                // required: true,
            },
            parking: {
                type: DataTypes.ENUM("BIKE", "CAR", "BOTH", "NONE"),
                // required: true,
            },
            floor_plan: DataTypes.STRING,
            master_plan: DataTypes.STRING,
            brochure: DataTypes.STRING,
            isActive: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            isVerified: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            salePrice: DataTypes.DOUBLE,
            area: DataTypes.DOUBLE,
            booking_amt_percentage: DataTypes.DOUBLE,
            maintenance_price: DataTypes.DOUBLE,
            possession: DataTypes.ENUM("IMMEDIATE", "1M", "6M", "1Y", "2Y", "3Y", "4Y", "5Y"),
            rera_number: DataTypes.STRING,
            description: DataTypes.STRING,
            isDeleted: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            lift: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            wifi: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            club_house: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            swimming_pool: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            reserved_parking: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            security: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            park: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            gym: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            power_back_up: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            water_storage: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            intercomFacility: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            laundryService: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            maintenanceStaff: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            outdoorTennisCourts: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            wasteDisposal: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            workFromHomeFacility: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            helipad: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            spaAndSauna: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            banquetHall: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },

            barLounge: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },            
            cafeteriaFoodCourt: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            conciergeServices: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            conferenceRoom: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            dthTelevisionFacility: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            downtown: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            fingerprintAccess: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            fireplace: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            herbalGarden: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            golfCourse: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            healthClubWithSteamJaccuzi: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            jacuzzi: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            hilltop: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            coverImage: {
                type: DataTypes.STRING,
                defaultValue: null
            },
            adminAdded: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
            promoteAs: {
                type: DataTypes.ENUM("FEATURED", "TRENDING", "NORMAL")
            }

        },
        {
            sequelize,
            modelName: "properties",
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
    return properties;
};
