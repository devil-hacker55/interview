"use-strict";
const createHttpError = require("http-errors");
const db = require("../models");
const { users } = require("../models/index");
const { userTypes, roles } = require("../utils/strings");

module.exports = {

  userVerificationMiddleware: async (req, res, next) => {
    const { permissionName, readWriteValue, allowedRoles } = req.apiCallData;
    console.log("==================================");
    console.log("PermissionName >>>", permissionName);
    console.log("readWriteValue >>>", readWriteValue);
    //userId mismatch code pending
    // user verification
    console.log("authorize fn payload => ", req.user);
    console.log("==================================");

    let user = await users.findByPk(req.user.id);
    if (!user) throw new createHttpError.Unauthorized();

    // authentication and authorization successful
    // refresh token fetch
    const refreshTokens = await user.getRefreshTokens({ raw: true });
    req.user.ownsToken = (token) =>
      !!refreshTokens.find((x) => x.token === token);

    //getting all user roles
    // const userroles = await user.getRoles({
    //   raw: true,
    // });
    // console.log("userroles22", userroles)
    // const rolesIdArray = [];
    // userroles.map((role) => {
    //   rolesIdArray.push(role.id);
    // });
    // req.user.userroles = rolesIdArray;
    req.user.id = user.id;
    console.log("==================================");
    console.log("user details >>>", user.id);
    console.log("==================================");

    console.log("==================================");
    // allowedRoles = [
    //   ...allowedRoles,
    //   "SHOP"
    // ]
    // allowedRoles.push("SHOP");
    console.log(
      "allowed Roles>>>>>>>",
      allowedRoles,
      "user Current userType>>>",
      user.userType
    );
    console.log("==================================");

    const verify =
      allowedRoles &&
      allowedRoles.length > 0 &&
      allowedRoles.includes(user.userType.toUpperCase());

    console.log("role check result>>>>>>>", verify);
    console.log("==================================");

    if (!verify) throw new createHttpError.Forbidden("User not allowed");
    req.apiCallData.user = user.dataValues;
    // next()
    // if ([userTypes.CLIENT, userTypes.EMPLOYEE].includes(user.userType.toUpperCase())) {
    //   // if ([userTypes.EMPLOYEE, userTypes.SHOP,userTypes.WAREHOUSE].includes(
    //   //   user.userType.toUpperCase()
    //   // ))
    //   // {
    //   //   let role1 = await db.roles.findOne({
    //   //     where :{
    //   //       roleName : "client",
    //   //       isRoot  : 1
    //   //     }
    //   //   })
    //   //   req.user.userroles.push(role1.id)
    //   // }
    //   return module.exports.roleSubscriptionCheck(req, res, next);
    // } else {
      console.log("in else case subscription skipped");
      return next();
    //}
    // return PromiseHandler(module.exports.roleMiddleware)
  },
};
