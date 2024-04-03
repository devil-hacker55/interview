"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      users.hasOne(models.clients);


      users.hasMany(models.refreshTokens, { onDelete: "CASCADE" });
      users.hasMany(models.properties, { onDelete: "CASCADE" });
      users.hasMany(models.property_visits, { onDelete: "CASCADE" });

      // users.hasMany(models.employees, { foreignKey: "parentId", targetKey: "id", as: "childemployees" })
      // users.hasMany(models.users, {
      //   foreignKey: "parentId",
      //   targetKey: "id",
      //   as: "childs",
      // });
      // users.belongsTo(models.users, {
      //   foreignKey: "parentId",
      //   targetKey: "id",
      //   as: "parent",
      // });

      //features
    }
  }
  users.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      firstName: {
        type: DataTypes.STRING,
        required: true,
      },
      lastName: {
        type: DataTypes.STRING,
        required: true,
      },
      fullName: {
        type: DataTypes.VIRTUAL,
        get() {
          return `${this.firstName} ${this.lastName}`;
        },
      },
      email: {
        type: DataTypes.STRING,
        // unique: true,
        // required: true
      },
      password: DataTypes.STRING,
      profileImage: DataTypes.STRING,
      addSignature: DataTypes.STRING,
      mobile: {
        type: DataTypes.STRING,
        //unique: true,
        // required: true
      },
      newMobile: {
        type: DataTypes.STRING,
      },
      resetToken: DataTypes.STRING,
      resetTokenExpires: DataTypes.DATE,
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      otpExpires: DataTypes.DATE,
      isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      userType: DataTypes.ENUM("CUSTOMER", "CLIENT", "EMPLOYEE", "SA"),
      mobileotp: DataTypes.STRING,
      emailotp: DataTypes.STRING,
      isGoogleLogin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      mailPassword: {
        type: DataTypes.STRING,
      },
      mailService: {
        type: DataTypes.STRING,
      },
      mailHost: {
        type: DataTypes.STRING,
      },
      mailPort: {
        type: DataTypes.INTEGER,
      },
      language: {
        type: DataTypes.STRING,
        defaultValue: 'en',
      },
      industryType: {
        type: DataTypes.ENUM("Retail", "Supermarket", "Transporting", "Spare Parts", "Manufacturing")
      }
    },
    {
      sequelize,
      modelName: "users",
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

  // Adding a instance level method
  users.prototype.getBasicDetails = function () {
    return { id: this.id, firstName: this.firstName };
  };
  return users;
};
