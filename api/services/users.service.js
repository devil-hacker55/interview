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
  hash,
  generateJwtToken,
  generateRefreshToken,
  getRefreshToken,
  randomTokenString,
} = require("../helpers/token");
const {
  getNumberOfDigits,
  getNumberWithZeros,
  sameBarcodeTwiceCheck,
  getPagination,
  getPagingData,
  addWithLeadingZeros,
} = require("../utils/commonUtils");
const { userTypes, roles } = require("../utils/strings");
const { getUrl, deleteFile } = require("../helpers/aws-s3");
const { getUserId } = require("../controllers/users.controller");

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
  clientRegister: async (reqObj) => {
    let userFound = await db.users.scope("withHash").findOne({
      where: {
        email: reqObj.email,
        userType: userTypes.CLIENT,
      },
    });
    if (userFound)
      throw new createHttpError.Conflict("User Already Exists with this email");

    reqObj.password = await hash(reqObj.password);
    // reqObj.mobileotp = commonUtils.generateRandom(6)
    reqObj.emailotp = commonUtils.generateRandom(6);
    reqObj.otpExpires = moment().add(55, "m").toDate();
    reqObj.userType = userTypes.CLIENT;

    //let roleInstance = await rolesService.getRoleByName(roles.CLIENT);
    let user;
    await db.sequelize.transaction(async (t) => {
      user = await db.users.create(reqObj)
      // user = await roleInstance.createUser(reqObj, {
      //   transaction: t,
      // });
      // await user.createClient(
      //   {},
      //   {
      //     transaction: t,
      //   }
      // );
      // await roleInstance.addUser(user, {
      //   transaction: t,
      // });
      // await user.setCountry(country, {
      //   transaction: t,
      // });
      // logger.info(user.toJSON());
      // let trialPlan = await db.subscription_plans.findOne(
      //   {
      //     where: {
      //       planName: "TRIAL PACK(30 Days)",
      //     },
      //   },
      //   { transaction: t }
      // );
      // let userSubscription = await user.createUser_subscription(
      //   {
      //     startValidity: new moment().utc(),
      //     endValidity: moment().utc().add(30, "days"),
      //     isActive: true,
      //     subscriptionPlanId: trialPlan.id,
      //     paymentStatus: true,
      //   },
      //   {
      //     transaction: t,
      //   }
      // );
      // let planFeatures = await trialPlan.getFeatures(
      //   {},
      //   {
      //     transaction: t,
      //   }
      // );
      // // console.log(abc)
      // await userSubscription.setFeatures(planFeatures, {
      //   transaction: t,
      // });
    });

    return {
      ...commonUtils.basicDetails(user),
      // mobileotp: reqObj.mobileotp,
      //user: user,
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
  getPropertyById: async (id) => {
    let user = await db.properties.findOne({
      where: {
        id: id,
      },
      include: [{
        model: db.useraddresses,
        required: false,
      },
      {
        model: db.property_images,
        required: false,
      },
      {
        model: db.categories,
        required: false,
      }],
    });
    if (!user) throw new createHttpError.NotFound("property not found");
    return user;
  },
  verifyClientOtp: async (email, emailotp, mobileotp) => {
    let user = await module.exports.getClientByEmail(email);
    console.log(user);
    // staticOTP
    if (mobileotp == 9988 || emailotp == 9988) {
      user.isVerified = true;
      user.isActive = true;
      user.emailotp = null;
      await user.save();
      return true;
    }

    console.log(moment.utc(user.otpExpires), "<", moment.utc());
    console.log(moment.utc(user.otpExpires).isBefore(moment.utc()));

    if (moment.utc(user.otpExpires).isBefore(moment.utc()))
      throw new createHttpError.NotAcceptable("Otp expired");
    console.log("oo>>", user.userType, user.emailotp, emailotp)
    if (user.userType != userTypes.CLIENT /*|| user.userType != userTypes.CUSTOMER */ || user.emailotp != emailotp)
      throw new createHttpError.NotAcceptable("Otp expired or invalid");
    user.isVerified = true;
    user.isActive = true;
    user.emailotp = null;
    await user.save();
    return true;
  },

  getAdminClientByEmail: async (email) => {
    let user = await db.users.scope("withHash").findOne({
      where: {
        email: email,
        userType: {
          [Op.or]: [userTypes.CLIENT,userTypes.SA],
        },
      },
    });
    if (!user) throw new createHttpError.NotFound("Client not found");
    return user;
  },
  addProperty: async (user, addProperty, propertyImages, address) => {
    addProperty.admin_status = "PENDING"
    let property = await user.createProperty(addProperty);
    await property.createUseraddress(address)
    await property.save()
    if (propertyImages.length > 0) {
      let productImagesData = propertyImages.map((image) => ({
        propertyId: property.id,
        productImage: image,
      }));
      await db.property_images.bulkCreate(productImagesData);
      console.log("This is image field", productImagesData);
    }
    return property;
  },
  getAllProperty: async (userId, search, page, size, purpose, admin_status, city, category, roomType) => {
    const { limit, offset } = getPagination(page, size);
    console.log("us", userId)
    let result = await db.properties.findAndCountAll({
      where: {
        ...(userId && { userId: userId }),

        ...(admin_status && { admin_status: admin_status }),

        ...(roomType && { roomType: roomType }),

        ...(search && {
          [Op.or]: {
            propertyName: {
              [Op.like]: `%${search}%`,
            },

          },
        }),

        ...(purpose && { purpose: purpose }),

      },
      attributes: [
        "id",
        "propertyName",
        "purpose",
        "admin_status",
        "propertyStatus",
        "propertyType",
        "roomType",
        "no_of_balconies",
        "No_of_bathrooms",
        "additional_rooms",
        "facing",
        "ownership",
        "floor",
        "furnishing",
        "parking",
        "floor_plan",
        "brochure",
        "isActive",
        "isVerified",
        "salePrice",
        "area",
        "booking_amt_percentage",
        "maintenance_price",
        "possession",
        "rera_number",
        "description",
        "isDeleted",
        "lift",
        "wifi",
        "club_house",
        "swimming_pool",
        "reserved_parking",
        "security",
        "park",
        "gym",
        "power_back_up",
        "water_storage",
        "coverImage",
        "createdAt"
      ],
      include: [{
        model: db.useraddresses,
        where: {
          ...(city && { city: city }),
        },
      },
      {
        model: db.property_images,
        required: false,
      },
      {
        model: db.categories,

        where: {
          ...(category && {
            category: {
              [Op.like]: `%${category}%`,
            },
          }),
        },
      }],
      distinct: true,
      order: [["createdAt", "desc"]],

      limit,
      offset,
    });

    if (result.rows.length <= 0)
      throw new createHttpError.NotFound("No properties found");
    const response = getPagingData(result, page, limit);
    return response;
  },
  getAllCategory: async (search) => {
    let addr = await db.categories.findAndCountAll({
      attributes: ['id', 'category'],
      where: {
        ...(search) && {
          [Op.or]: {
            category: {
              [Op.like]: `%${search}%`
            }
          }
        },
      },
    })
    if (addr.rows <= 0) throw new createHttpError.NotFound("data not found")
    return addr
  },
  changeStatusOfProperty: async (reqObj) => {
    let property = await db.properties.update({ admin_status: reqObj.admin_status }, { where: { id: reqObj.propertyId } });
    return property;
  },
  // dashboardCount1: async (userId) => {
  //   let property = await db.properties.findAll({
  //     where: {
  //       ...(userId && { userId: userId }),
  //     },
  //     attributes: [
  //       [db.sequelize.fn("COALESCE", db.sequelize.fn("SUM", db.sequelize.col("id")), 0), "total_properties"],
  //       [db.sequelize.fn("COALESCE", db.sequelize.fn("SUM", db.sequelize.col("purpose")), 0), "total_properties"]
  //     ]
  //   })
  //   return property;
  // },

  dashboardCount: async (userId) => {
    let counts = await db.properties.findAll({
      where: {
        ...(userId && { userId: userId }),
      },
      attributes: [
        [db.sequelize.fn("COALESCE", db.sequelize.fn("COUNT", db.sequelize.col("*")), 0), "total_properties"],
        [db.sequelize.fn("SUM", db.sequelize.literal("CASE WHEN purpose = 'SELL' THEN 1 ELSE 0 END")), "sell_properties"],
        [db.sequelize.fn("SUM", db.sequelize.literal("CASE WHEN purpose = 'RENT' THEN 1 ELSE 0 END")), "rent_properties"]
      ],
      raw: true,
      //group: []
    });
    let totalCount = counts.reduce((acc, curr) => acc + curr.total_properties, 0);
    let sellCount = parseInt(counts[0].sell_properties) || 0; // Parse to integer
    let rentCount = parseInt(counts[0].rent_properties) || 0; // Parse to integer

    return {
      total_properties: totalCount,
      sell_properties: sellCount,
      rent_properties: rentCount,
    };
  },

  contactProperty: async (userId, propertyId) => {
    await module.exports.getUserById(userId);
    await module.exports.getPropertyById(propertyId);
    let existingVisit = await db.property_visits.findOne({
      where: {
        userId: userId,
        propertyId: propertyId
      }
    });
    console.log(existingVisit)
    if (existingVisit) {
      // If an existing visit record is found, update the visitedAt timestamp
      let countValue = existingVisit.count
      await existingVisit.update({ contactedAt: new Date(), count: countValue + 1 });

      console.log(`Property visit updated: Client ${userId}, Property ${propertyId}`);
    } else {
      // If no existing visit record is found, create a new one
      await db.property_visits.create({
        userId: userId,
        propertyId: propertyId,
        count: 1,
        contactedAt: new Date() // Current timestamp
      });

      return true
    }
  },
  getAllPropertyVisits: async (userId, page, size,) => {
    const { limit, offset } = getPagination(page, size);
    console.log("us", userId)
    let result = await db.property_visits.findAndCountAll({
      // where: {
      //   ...(userId && { userId: userId }),

      //   ...(admin_status && { admin_status: admin_status }),

      //   ...(roomType && { roomType: roomType }),

      //   ...(search && {
      //     [Op.or]: {
      //       propertyName: {
      //         [Op.like]: `%${search}%`,
      //       },

      //     },
      //   }),

      //   ...(purpose && { purpose: purpose }),

      // },
      include: [{
        model: db.properties,
        // where: {
        //   ...(city && {
        //     city: {
        //       [Op.like]: `%${city}%`,
        //     },
        //   }),
        // },
      },
      {
        model: db.users,
        required: false,
      }
      ],
      distinct: true,
      order: [["createdAt", "desc"]],

      limit,
      offset,
    });

    if (result.rows.length <= 0)
      throw new createHttpError.NotFound("No properties found");
    const response = getPagingData(result, page, limit);
    return response;
  },
  likeProperty: async (user, propertyId) => {
    await module.exports.getPropertyById(propertyId);

    //console.log("addFcmKey Service Called ::", reqObj)

    let [result, isCreated] = await db.likes.findOrCreate({
      where: { propertyId: propertyId, userId: user.id },
      //defaults: reqObj,
    })

    console.log("addFcmKey Service Called 1111::", result)
    console.log("addFcmKey Service Called 222::", isCreated)
    if (!isCreated) {
      // result.set(reqObj)
      // result.save()
      throw new createHttpError.Conflict("Already liked")
    }
    return result;

  },
  getUserLikedProperties: async (user) => {
    let data = await user.getLikes({
      include: {
        model: db.properties
      }
    })
    return data;

  },
};
