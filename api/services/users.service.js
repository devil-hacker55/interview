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
const { getUserId, editProperty, downloadBrochure } = require("../controllers/users.controller");

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
  getPropertyByIdForBrochure: async (id) => {
    let user = await db.properties.findOne({
      where: {
        id: id,
      },
      attributes: ["brochure", "propertyStatus"]
      // include: [{
      //   model: db.useraddresses,
      //   required: false,
      // },
      // {
      //   model: db.property_images,
      //   required: false,
      // },
      // {
      //   model: db.categories,
      //   required: false,
      // }],
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
          [Op.or]: [userTypes.CLIENT, userTypes.SUPERADMIN],
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
  editProperty: async (propertyId, addProperty, propertyImages, address) => {
    let property = await module.exports.getPropertyById(propertyId);
    //let property = await user.createProperty(addProperty);
    if (addProperty) {
      await property.set(addProperty)
      await property.save();
      await property.reload();
    }
    if (propertyImages.length > 0) {
      await db.property_images.destroy({
        where: {
          propertyId: property.id
        }
      });
      let productImagesData = propertyImages.map((image) => ({
        propertyId: property.id,
        productImage: image,
      }));
      await db.property_images.bulkCreate(productImagesData);
      await property.reload();
    }
    if (address) {
      let primaryAdd = await property.getUseraddress();
      if (primaryAdd) {
        await primaryAdd.set(address);
        await primaryAdd.save();
      } else {
        await property.createUseraddress(address);
      }
    }
    return property;
  },
  getAllProperty: async (userId, search, page, size, purpose, admin_status, city, category, roomType, propertyStatus, promoteAs, adminAdded) => {
    const { limit, offset } = getPagination(page, size);
    let result = await db.properties.findAndCountAll({
      where: {
        //...(userId && { userId: userId }),

        ...(adminAdded && { adminAdded: adminAdded }),

        ...(admin_status && { admin_status: admin_status }),

        ...(roomType && { roomType: roomType }),

        ...(propertyStatus && { propertyStatus: propertyStatus }),

        ...(promoteAs && { promoteAs: promoteAs }),

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
        "promoteAs",
        "roomType",
        "rentPrice",
        "depositAmount",
        "no_of_balconies",
        "No_of_bathrooms",
        "additional_rooms",
        "facing",
        "ownership",
        "floor",
        "furnishing",
        "parking",
        "floor_plan",
        "master_plan",
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
        "adminAdded",
        "createdAt"
      ],
      include: [
        {
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
          //required: false,
          where: {
            ...(category && {category: category}),
          },
        },
        {
          model: db.likes,
          required: false,
          where: userId ? { userId: userId } : {}, // Filter likes by current user
          attributes: ['createdAt'], // Exclude all columns except the count
        }
      ],
      distinct: true,
      //order: [["createdAt", "desc"]],
      order: [
        // First, sort by promoteAs="TRENDING"
        [db.sequelize.literal('promoteAs = "TRENDING"'), 'DESC'], // This will push "TRENDING" properties to the top
        ['createdAt', 'desc'] // Then, sort by createdAt in descending order
      ],
      limit,
      offset,
    });

    // if (result.rows.length <= 0)
    //   throw new createHttpError.NotFound("No properties found");
    const propertiesWithLikes = result.rows.map(property => {
      let isLiked = false; // Set isLiked to false by default
      if (userId) {
        console.log("INNNNNNN")
        // If userId is provided, check if the property has any likes by the user
        isLiked = property.likes.length > 0;
      }
      return { ...property.toJSON(), isLiked };
    });

    const response = getPagingData({ ...result, rows: propertiesWithLikes }, page, limit);
    return response;
  },
  getAllPropertyCustomer: async (userId, search, page, size, purpose, admin_status, city, category, roomType, propertyStatus, promoteAs, adminAdded) => {
    const { limit, offset } = getPagination(page, size);
    console.log("us111", userId)
    let result = await db.properties.findAndCountAll({
      where: {
        admin_status: {
          [Op.ne]: "REJECTED"
        },
        //...(userId && { userId: userId }),

        ...(adminAdded && { adminAdded: adminAdded }),

        ...(admin_status && { admin_status: admin_status }),

        ...(roomType && { roomType: roomType }),

        ...(propertyStatus && { propertyStatus: propertyStatus }),

        ...(promoteAs && { promoteAs: promoteAs }),

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
        "promoteAs",
        "roomType",
        "rentPrice",
        "depositAmount",
        "no_of_balconies",
        "No_of_bathrooms",
        "additional_rooms",
        "facing",
        "ownership",
        "floor",
        "furnishing",
        "parking",
        "floor_plan",
        "master_plan",
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
        "adminAdded",
        "createdAt"
      ],
      include: [
        {
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
          required: false,
          where: {
            ...(category && {
              category: {
                [Op.like]: `%${category}%`,
              },
            }),
          },
        },
        {
          model: db.likes,
          required: false,
          where: userId ? { userId: userId } : {}, // Filter likes by current user
          attributes: ['createdAt'], // Exclude all columns except the count
        }
      ],
      distinct: true,
      //order: [["createdAt", "desc"]],
      order: [
        // First, sort by promoteAs="TRENDING"
        [db.sequelize.literal('promoteAs = "TRENDING"'), 'DESC'], // This will push "TRENDING" properties to the top
        ['createdAt', 'desc'] // Then, sort by createdAt in descending order
      ],
      limit,
      offset,
    });

    // if (result.rows.length <= 0)
    //   throw new createHttpError.NotFound("No properties found");
    const propertiesWithLikes = result.rows.map(property => {
      let isLiked = false; // Set isLiked to false by default
      if (userId) {
        console.log("INNNNNNN")
        // If userId is provided, check if the property has any likes by the user
        isLiked = property.likes.length > 0;
      }
      return { ...property.toJSON(), isLiked };
    });

    const response = getPagingData({ ...result, rows: propertiesWithLikes }, page, limit);
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
    module.exports.getPropertyById(reqObj.propertyId)
    let property = await db.properties.update({ admin_status: reqObj.admin_status }, { where: { id: reqObj.propertyId } });
    return property;
  },
  changeStatusOfContactUs: async (reqObj) => {
    //module.exports.getPropertyById(reqObj.propertyId)
    let data = await db.contactus.findOne({
      where:{
        id:reqObj.contactUsId
      }
    })
    if(!data )  throw new createHttpError.NotFound("contactus not found")
    let property = await db.contactus.update({ status: reqObj.status }, { where: { id: reqObj.contactUsId } });
    return property;
  },
  changeStatusOfPromoteAs: async (reqObj) => {
    module.exports.getPropertyById(reqObj.propertyId)
    let property = await db.properties.update({ promoteAs: reqObj.promoteAs }, { where: { id: reqObj.propertyId } });
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
      },
      include: {
        model: db.properties,
        required: false,
        attributes: ["propertyName"],
        include: {
          model: db.users,
          required: false,
          attributes: ["firstName", "mobile"],
        }
      }
    });
    console.log("existingVisit???", existingVisit);
    if (existingVisit) {
      // If an existing visit record is found, update the visitedAt timestamp
      let countValue = existingVisit.count
      await existingVisit.update({ contactedAt: new Date(), count: countValue + 1, status: "PENDING" });

      console.log(`Property visit updated: Client ${userId}, Property ${propertyId}`);
      return {
        message: `Property visit updated: Client ${userId}, Property ${propertyId}`,
        ownerName: existingVisit.property.user.firstName,
        ownerMobile: existingVisit.property.user.mobile
      }
    }
    else {
      let property = await db.properties.findOne({
        where: {
          id: propertyId
        },
        include: {
          model: db.users,
          required: false,
          attributes: ["firstName", "mobile"],
        }
      })
      // If no existing visit record is found, create a new one
      await db.property_visits.create({
        userId: userId,
        propertyId: propertyId,
        count: 1,
        status: "PENDING",
        contactedAt: new Date() // Current timestamp
      });

      return {
        message: `Property visit updated: Client ${userId}, Property ${propertyId}`,
        ownerName: property.user.firstName,
        ownerMobile: property.user.mobile
      }
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
  getAllImagesLogos: async () => {
    let banklogos = await db.banklogos.findAll()
    let propertylogos = await db.propertylogos.findAll()
    let citylogos = await db.citylogos.findAll()
    return {banklogos,propertylogos,citylogos};
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
      result.destroy(result)
      // result.save()
      return { msg: "unliked successfully" }
    }
    return result;

  },
  getUserLikedProperties: async (user) => {
    let data = await user.getLikes({
      attributes: ["id"],
      include: {
        model: db.properties,
        include: {
          model: db.useraddresses,
          attributes: ['address']
          // where: {
          //   ...(city && { city: city }),
          // },
        },
      }
    })
    return data;

  },
  addInsight: async (user, reqObj) => {

    let result = await user.createInsight(reqObj)
    return result;

  },
  getAllInsight: async (page, size) => {
    const { limit, offset } = getPagination(page, size);
    let result = await db.insights.findAndCountAll({
      // include: {
      //   model: db.users
      // },
      distinct: true,
      order: [["createdAt", "desc"]],
      limit,
      offset,
    });

    if (result.rows.length <= 0)
      throw new createHttpError.NotFound("No insights found");
    const response = getPagingData(result, page, limit);
    return response;
  },
  getInsightById: async (id) => {
    let user = await db.insights.findOne({
      where: {
        id: id,
      },
      attributes: ["id", "description", "title", "image", "createdAt"],
      include: {
        model: db.users,
        attributes: ["firstName", "userType"],
        required: false,
      },
    });
    if (!user) throw new createHttpError.NotFound("property not found");
    return user;
  },
  getAllPropertiesVisited: async (id) => {
    let user = await db.property_visits.findAll({
      group: ["propertyId"],
      order: [["createdAt", "DESC"]],
      attributes: ["id", "propertyId"],
      include: {
        model: db.properties,
        attributes: ["id", "propertyName"],
      }
    });
    if (!user) throw new createHttpError.NotFound("property not found");
    return user;
  },
  whoVisitedProperty1: async (propertyId) => {
    let user = await db.property_visits.findAll({
      where: {
        propertyId: propertyId,
      },
      group: ["userId"],
      order: [["createdAt", "DESC"]],
      attributes: ["id", "count", "propertyId", "contactedAt", "userId"],
      include: [{
        model: db.users,
        attributes: ["id", "firstName", "mobile", "email"],
      }, {
        model: db.properties,
        attributes: ["id", "propertyName", "purpose", "propertyStatus", "propertyType", "roomType", "parking", "salePrice", "area", "no_of_balconies", "No_of_bathrooms", "coverImage", "booking_amt_percentage", "maintenance_price"],
        include: {
          model: db.useraddresses,
          attributes: ["id", "address", "pincode", "city"],
        }
      }]
    });
    if (!user) throw new createHttpError.NotFound("property not found");
    return user;
  },
  whoVisitedProperty: async (propertyId) => {
    let user = await db.property_visits.findAll({
      where: {
        propertyId: propertyId,
      },
      //group: ["userId"],
      order: [["createdAt", "DESC"]],
      attributes: ["id", "count", "contactedAt", "userId", "status"],
      include: [{
        model: db.users,
        attributes: ["id", "firstName", "mobile", "email"],
      }]
    });
    let data = await db.properties.findOne({
      where: {
        id: propertyId
      },
      attributes: ["id", "propertyName", "purpose", "propertyStatus", "propertyType", "roomType", "parking", "salePrice", "area", "no_of_balconies", "No_of_bathrooms", "coverImage", "booking_amt_percentage", "maintenance_price", "rentPrice",
        "depositAmount",],
      include: {
        model: db.useraddresses,
        attributes: ["id", "address", "pincode", "city"],
      }
    })
    if (!user) throw new createHttpError.NotFound("visits not found");
    return {
      userData: user,
      propertyData: data
    };
  },
  changeVisitStatus: async (body, visitId) => {
    if (body.key === "LEAD") {
      console.log("leads", visitId);
      let data = await db.property_visits.findOne({
        where: {
          id: visitId,
        }
      });
      if (!data) throw new createHttpError.NotFound("visits not found");
      await data.update({
        status: body.status
      });
      await data.save();
      return data;
    } else if (body.key === "ZOOM") {
      let data = await db.bookmeets.findOne({
        where: {
          purpose: "ZOOM",
          id: visitId,
        }
      });
      if (!data) throw new createHttpError.NotFound("booking not found");
      await data.update({
        status: body.status
      });
      await data.save();
      return data;
    } else if (body.key === "CAB") {
      let data = await db.bookmeets.findOne({
        where: {
          purpose: "CAB",
          id: visitId,
        }
      });
      if (!data) throw new createHttpError.NotFound("Cab booking request not found");
      await data.update({
        status: body.status
      });
      await data.save();
      return data;
    }
    return data;
  },
  bookCabZoom: async (body, user) => {
    body.status = "PENDING";
    let alreadyBooked = await db.bookmeets.findOne({
      where: {
        propertyId: body.propertyId,
        userId: user.id,
        purpose: body.purpose,
        status: "PENDING"
      }
    })
    if (alreadyBooked) throw new createHttpError.Conflict("You already have booked,please wait for our team to revert back.")

    let property = await module.exports.getPropertyById(body.propertyId)
    if (property.propertyStatus != "UNDERCONSTRUCTION") throw new createHttpError.NotAcceptable("feature is for underconstructor properties")
    console.log(property.propertyStatus)

    let data = await user.createBookmeet(body)
    return data;
  },
  downloadBrochure: async (body, user) => {
    body.status = "PENDING";
    let alreadyBooked = await db.bookmeets.findOne({
      where: {
        propertyId: body.propertyId,
        userId: user.id,
        purpose: body.purpose,
        status: "PENDING"
      }
    })
    console.log("lllll", alreadyBooked)
    if (alreadyBooked) throw new createHttpError.Conflict("You already downloaded brochure,please wait for our team to revert back.")

    let property = await module.exports.getPropertyByIdForBrochure(body.propertyId)
    if (property.propertyStatus != "UNDERCONSTRUCTION") throw new createHttpError.NotAcceptable("feature is for underconstructor properties")
    console.log(property.propertyStatus)

    await user.createBookmeet(body)
    //data.brochureLink = property.brochure
    return property
  },
  getAllCabBookingRequests: async (id) => {
    let user = await db.bookmeets.findAll({
      group: ["propertyId"],
      order: [["createdAt", "DESC"]],
      where: {
        purpose: "CAB"
      },
      attributes: ["id", "propertyId"],
      include: {
        model: db.properties,
        attributes: ["id", "propertyName"],
      }
    });
    if (!user) throw new createHttpError.NotFound("property not found");
    return user;
  },
  cabBookingUsers: async (propertyId) => {
    let user = await db.bookmeets.findAll({
      where: {
        purpose: "CAB",
        propertyId: propertyId,
      },
      //group: ["userId"],
      order: [["createdAt", "DESC"]],
      attributes: ["id", "purpose", "userId", "status"],
      include: [{
        model: db.users,
        attributes: ["id", "firstName", "mobile", "email"],
      }]
    });
    let data = await db.properties.findOne({
      where: {
        id: propertyId
      },
      attributes: ["id", "propertyName", "purpose", "propertyStatus", "propertyType", "roomType", "parking", "salePrice", "area", "no_of_balconies", "No_of_bathrooms", "coverImage", "booking_amt_percentage", "maintenance_price", "rentPrice",
        "depositAmount",],
      include: {
        model: db.useraddresses,
        attributes: ["id", "address", "pincode", "city"],
      }
    })
    if (!user) throw new createHttpError.NotFound("cab booking not found");
    return {
      userData: user,
      propertyData: data
    };
  },
  getAllZoomBookingRequests: async (id) => {
    let user = await db.bookmeets.findAll({
      group: ["propertyId"],
      order: [["createdAt", "DESC"]],
      where: {
        purpose: "ZOOM"
      },
      attributes: ["id", "propertyId"],
      include: {
        model: db.properties,
        attributes: ["id", "propertyName"],
      }
    });
    if (!user) throw new createHttpError.NotFound("property not found");
    return user;
  },
  zoomBookingUsers: async (propertyId) => {
    let user = await db.bookmeets.findAll({
      where: {
        purpose: "ZOOM",
        propertyId: propertyId,
      },
      //group: ["userId"],
      order: [["createdAt", "DESC"]],
      attributes: ["id", "purpose", "userId", "status"],
      include: [{
        model: db.users,
        attributes: ["id", "firstName", "mobile", "email"],
      }]
    });
    let data = await db.properties.findOne({
      where: {
        id: propertyId
      },
      attributes: ["id", "propertyName", "purpose", "propertyStatus", "propertyType", "roomType", "parking", "salePrice", "area", "no_of_balconies", "No_of_bathrooms", "coverImage", "booking_amt_percentage", "maintenance_price", "rentPrice",
        "depositAmount",],
      include: {
        model: db.useraddresses,
        attributes: ["id", "address", "pincode", "city"],
      }
    })
    if (!user) throw new createHttpError.NotFound("cab booking not found");
    return {
      userData: user,
      propertyData: data
    };
  },
  getAllBrochureRequests: async (id) => {
    let user = await db.bookmeets.findAll({
      group: ["propertyId"],
      order: [["createdAt", "DESC"]],
      where: {
        purpose: "BROCHURE"
      },
      attributes: ["id", "propertyId"],
      include: {
        model: db.properties,
        attributes: ["id", "propertyName"],
      }
    });
    if (!user) throw new createHttpError.NotFound("property not found");
    return user;
  },
  brochureUsers: async (propertyId) => {
    let user = await db.bookmeets.findAll({
      where: {
        purpose: "BROCHURE",
        propertyId: propertyId,
      },
      //group: ["userId"],
      order: [["createdAt", "DESC"]],
      attributes: ["id", "purpose", "userId", "status"],
      include: [{
        model: db.users,
        attributes: ["id", "firstName", "mobile", "email"],
      }]
    });
    let data = await db.properties.findOne({
      where: {
        id: propertyId
      },
      attributes: ["id", "propertyName", "purpose", "propertyStatus", "propertyType", "roomType", "parking", "salePrice", "area", "no_of_balconies", "No_of_bathrooms", "coverImage", "booking_amt_percentage", "maintenance_price", "rentPrice",
        "depositAmount",],
      include: {
        model: db.useraddresses,
        attributes: ["id", "address", "pincode", "city"],
      }
    })
    if (!user) throw new createHttpError.NotFound("brochure not found");
    return {
      userData: user,
      propertyData: data
    };
  },
  yt: async (body, user) => {
    let data = await user.createYoutube(body)
    return data;
  },
  getAllYt: async (page, size) => {
    const { limit, offset } = getPagination(page, size);
    let result = await db.youtubes.findAndCountAll({
      // include: {
      //   model: db.users
      // },
      distinct: true,
      order: [["createdAt", "desc"]],
      limit,
      offset,
    });

    if (result.rows.length <= 0)
      throw new createHttpError.NotFound("No youtube links found");
    const response = getPagingData(result, page, limit);
    return response;
  },
  contactUs: async (reqObj) => {
      let data = await db.contactus.create(reqObj)
      return data
  },
  getAllContactUs: async (page, size) => {
    const { limit, offset } = getPagination(page, size);
    let result = await db.contactus.findAndCountAll({
      // include: {
      //   model: db.users
      // },
      distinct: true,
      order: [["createdAt", "desc"]],
      limit,
      offset,
    });

    if (result.rows.length <= 0)
      throw new createHttpError.NotFound("No enquiries found");
    const response = getPagingData(result, page, limit);
    return response;
  },
  deleteProperty: async (propertyId) => {
    await module.exports.getPropertyById(propertyId)
    await db.properties.destroy({ where: { id: propertyId } });
    return true
  },
  
};
