"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class clients extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      //M:M roles can have many permissions and permissions can have many roles
      clients.belongsTo(models.users, { onDelete: "CASCADE" });
    }
  }
  clients.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      isRegistered: DataTypes.BOOLEAN,
      isRemoteShop: DataTypes.BOOLEAN,
      // addressOfBusiness: DataTypes.STRING,
      legalName: DataTypes.STRING,
      // tradeName: DataTypes.STRING,
      businessType: DataTypes.ENUM(
        "Proprietorship",
        "Partnership",
        "Private Limited Company",
        "Public Limited Company",
        "Limited Liability Partnership",
        "Hindu Undivided Family",
        "Sole proprietorship",
        "Civil Company",
        "Limited Liability Company (LLC)",
        "Private Share Holding Company",
        "Public Share Holding Company",
        "Branch of Foreign Companies/Representative Office",
        "Branch of GCC companies",
        "Branch of Free zone company",
        "Branch of Dubai based companies",
        "Branch of UAE based companies"

      ),
      gstType: DataTypes.ENUM("Regular", "Composite", "Exempted"),
      gstinNo: DataTypes.STRING,
      compositeType: DataTypes.ENUM(
        "Trader",
        "Manufacturer",
        "Restaurant",
        "Service Provider"
      ),
      accountMethod: DataTypes.ENUM(
        "Accounts",
        "Accounts With Stock Management"
        // "Both" // both option removed in new changes
      ),
      // new additional properties
      panNumber: DataTypes.STRING,
      tradeName: DataTypes.STRING,
      financialYearFrom: DataTypes.STRING,
      bookBeginningFrom: DataTypes.STRING,
      cinNumber: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "clients",
      defaultScope: {
        // exclude password hash by default
        attributes: { exclude: ["createdAt", "updatedAt"] },
      },
      scopes: {
        // include hash with this scope
        withHash: { attributes: {} },
      },
    }
  );
  return clients;
};
