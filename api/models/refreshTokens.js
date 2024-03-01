'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class refreshTokens extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    refreshTokens.belongsTo(models.users);
    }
  };
  refreshTokens.init({
    token: { type: DataTypes.STRING },
    expires: { type: DataTypes.DATE },
    createdByIp: { type: DataTypes.STRING },
    revoked: { type: DataTypes.DATE },
    revokedByIp: { type: DataTypes.STRING },
    replacedByToken: { type: DataTypes.STRING },
    isExpired: {
        type: DataTypes.VIRTUAL,
        get() { return Date.now() >= this.expires; }
    },
    isActive: {
        type: DataTypes.VIRTUAL,
        get() { return !this.revoked && !this.isExpired; }
    }
  }, {
    sequelize,
    modelName: 'refreshTokens',
  });
  return refreshTokens;
};