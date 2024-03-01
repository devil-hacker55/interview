"use strict";
/**
 * this module is used to define users.controller
 * @module users.service
 * @author #
 * @version 1.0
 */

/**
 *  import project modules
 */

// required
const db = require("../models");
const createHttpError = require("http-errors");
const { Op } = require("sequelize");
const commonUtils = require("../utils/commonUtils");
const logger = require("../helpers/logger");
const moment = require("moment");
const models = require("../models");
const {
  getNumberOfDigits,
  getNumberWithZeros,
  sameBarcodeTwiceCheck,
  getPagination,
  getPagingData,
  addWithLeadingZeros,
} = require("../utils/commonUtils");
const { getUrl, deleteFile } = require("../helpers/aws-s3");

for (let model of Object.keys(db)) {
  if (models[model].name === "Sequelize") continue;
  if (!models[model].name) continue;

  console.log(
    "\n\n----------------------------------\n",
    models[model].name,
    "\n----------------------------------"
  );

  console.log("\nAssociations");
  for (let assoc of Object.keys(models[model].associations)) {
    for (let accessor of Object.keys(
      models[model].associations[assoc].accessors
    )) {
      console.log(
        models[model].name +
        "." +
        models[model].associations[assoc].accessors[accessor] +
        "()"
      );
    }
  }
}

module.exports = {
  clientRegister: async (reqObj, googleLoginFlag, country) => {
    let userFound = await db.users.scope("withHash").findOne({
      where: {
        email: reqObj.email,
        userType: userTypes.CLIENT,
      },
    });
    if (userFound)
      throw new createHttpError.Conflict("User Already Exists with this email");

    reqObj.password = googleLoginFlag ? null : await hash(reqObj.password);
    // reqObj.mobileotp = commonUtils.generateRandom(6)
    reqObj.emailotp = commonUtils.generateRandom(6);
    reqObj.otpExpires = moment().add(55, "m").toDate();
    reqObj.userType = userTypes.CLIENT;

    let roleInstance = await rolesService.getRoleByName(roles.CLIENT);
    let user;
    await db.sequelize.transaction(async (t) => {
      user = await roleInstance.createUser(reqObj, {
        transaction: t,
      });
      await user.createClient(
        {},
        {
          transaction: t,
        }
      );
      await roleInstance.addUser(user, {
        transaction: t,
      });
      await user.setCountry(country, {
        transaction: t,
      });
      logger.info(user.toJSON());
      let trialPlan = await db.subscription_plans.findOne(
        {
          where: {
            planName: "TRIAL PACK(30 Days)",
          },
        },
        { transaction: t }
      );
      let userSubscription = await user.createUser_subscription(
        {
          startValidity: new moment().utc(),
          endValidity: moment().utc().add(30, "days"),
          isActive: true,
          subscriptionPlanId: trialPlan.id,
          paymentStatus: true,
        },
        {
          transaction: t,
        }
      );
      let planFeatures = await trialPlan.getFeatures(
        {},
        {
          transaction: t,
        }
      );
      // console.log(abc)
      await userSubscription.setFeatures(planFeatures, {
        transaction: t,
      });
    });

    return {
      ...commonUtils.basicDetails(user),
      // mobileotp: reqObj.mobileotp,
      emailotp: reqObj.emailotp,
    };
  },

  customerRegister: async (reqObj) => {
    let userFound = await db.users.scope("withHash").findOne({
      where: {
        mobile: reqObj.mobile,
        userType: userTypes.CUSTOMER,
      },
    });
    if (userFound)
      throw new createHttpError.Conflict(
        "User Already Exists with this Mobile Number"
      );

    reqObj.mobileotp = commonUtils.generateRandom(6);
    reqObj.otpExpires = moment().add(55, "m").toDate();
    reqObj.isActive = true;
    reqObj.userType = userTypes.CUSTOMER;

    let roleInstance = await rolesService.getRoleByName(roles.CUSTOMER);
    let user = await roleInstance.createUser(reqObj);
    await user.createCustomer();
    await roleInstance.addUser(user);
    logger.info(user.toJSON());
    return {
      ...commonUtils.basicDetails(user),
      mobileOtp: user.mobileotp,
    };
  },
  updateUserMobile: async (reqObj, userId) => {
    //console.log("sdfwsfsfsfdsfsfsfsfsfsfs>>>>>>>>>",reqObj)
    let user = await module.exports.getUserById(userId);

    // let mobileotp = commonUtils.generateRandom(6);
    let motp = reqObj.mobile
    let mobileotp = motp.slice(-6);
    let otpExpires = moment().add(55, "m").toDate();
    user.mobileotp = mobileotp;
    user.newMobile = reqObj.mobile;
    user.otpExpires = otpExpires;
    // user.isVerified=false
    // user.isActive=false
    await user.save();

    // let roleInstance = await rolesService.getRoleByName(roles.CUSTOMER)
    // let user = await roleInstance.createUser(reqObj)
    // await roleInstance.addUser(user)
    // logger.info(user.toJSON())
    return {
      //...commonUtils.basicDetails(user),
      mobileOtp: mobileotp,
    };
  },
  getClientByEmail: async (email) => {
    let user = await db.users.scope("withHash").findOne({
      where: {
        email: email,
        //userType: [userTypes.CLIENT ,userTypes.EMPLOYEE]
        userType: {
          [Op.or]: [userTypes.CLIENT, userTypes.EMPLOYEE],
        },
      },
    });
    if (!user) throw new createHttpError.NotFound("Client not found");
    return user;
  },
  getUserById: async (id) => {
    let user = await db.users.findByPk(id);
    if (!user) throw new createHttpError.NotFound("user not found");
    return user;
  },
  addProperty: async (addProperty, propertyImages, address) => {
    let property = await db.properties.create(addProperty);
    let addr = await property.createUseraddress(address)
    await property.save()
    if (propertyImages.length > 0) {
      let productImagesData = propertyImages.map((image) => ({
        propertyId: property.id,
        productImage: image,
      }));
      await db.property_images.bulkCreate(productImagesData);
      console.log("This is image field", productImagesData);
    }
    //if (!user) throw new createHttpError.NotFound("user not found");
    return property;
  },
  getAllProperty: async (userId, search, page, size,purpose) => {
    console.log("HHHiii",purpose)
    const { limit, offset } = getPagination(page, size);
    let result = await db.properties.findAndCountAll({
      where: {
        //userId: userId,
        ...(search && {
          [Op.or]: {
            propertyName: {
              [Op.like]: `%${search}%`,
            },
            purpose: {
              [Op.like]: `%${purpose}%`,
            },
          },
        }),
      },
      include: [{
        model: db.useraddresses,
        //attributes: ["partyName", "gstIn", "totalDebt", "totalCredit"],
        // where: {
        //   ...(partyName && {
        //     partyName: partyName,
        //   }),
        // }
      }, {
        model: db.property_images,
      },
      {
        model: db.categories,
      }
    ],
      //order: [["properties.createdAt", "desc"]],
      distinct: true,
      limit,
      offset,
    });

    if (result.rows.length <= 0)
      throw new createHttpError.NotFound("property not found");
    const response = getPagingData(result, page, limit);
    return response;
  },
};
