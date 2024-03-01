require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const db = require("../models/index");
const createHttpError = require("http-errors");

module.exports = {
  hash: async function (password) {
    return await bcrypt.hash(password, 10);
  },
  hashSync: function (password) {
    return bcrypt.hashSync(password, 10);
  },
  comparePassword: async function (plainPassword, hashPassword) {
    console.log("<<>>??????", plainPassword, hashPassword);
    return await bcrypt.compare(plainPassword, hashPassword);
  },
  generateJwtToken: function (user) {
    // create a jwt token containing the user id that expires in 15 minutes
    return jwt.sign(
      {
        cid: user.cid,
        firstName: user.firstName,
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn:"365d", // for testing purposes
        audience: user.firstName ? user.firstName : "Sujay",
      }
    );
  },

  generateRefreshToken: function (user, ipAddress) {
    // create a refresh token that expires in 7 days
    console.log("PPP>>>",user)
    return db.refreshTokens.build({
      userId: user.id,
      token: module.exports.randomTokenString(),
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      createdByIp: ipAddress,
    });
  },
  randomTokenString: function () {
    return crypto.randomBytes(40).toString("hex");
  },

  getRefreshToken: async function (token) {
    const refreshToken = await db.refreshTokens.findOne({ where: { token } });
    // console.log("DBrefreshToken",refreshToken.dataValues)
    if (!refreshToken || !refreshToken.isActive)
      throw new createHttpError.Forbidden("Invalid Refresh token");
    return refreshToken;
  },

  setTokenCookie: async function (res, token) {
    // create cookie with refresh token that expires in 7 days
    const cookieOptions = {
      httpOnly: true,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };
    res.cookie("refreshToken", token, cookieOptions);
  },
};
