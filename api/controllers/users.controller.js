"use strict";
/**
 * this module is used to define users.controller
 * @module users.controller
 * @author #
 * @version 1.0
 */

/**
 *  import project modules
 */

// required
const db = require("../models");
const userService = require("../services/users.service");
const createHttpError = require("http-errors");
const commonUtils = require("../utils/commonUtils");
const { deleteFile, getUrl } = require("../helpers/aws-s3");
const logger = require("../helpers/logger");
const moment = require("moment");
const { PromiseHandler } = require("../middleware/error.handler");
const {
  comparePassword,
  hash,
  generateJwtToken,
  generateRefreshToken,
} = require("../helpers/token");
const { query } = require("express");
const { userTypes } = require("../utils/strings");
module.exports = {
  // client registeration function
  clientRegister: async (req, res, next) => {
    let reqObj = req.body;
    // if (req.google && req.google.alreadyRegistered) return next();
    logger.info(reqObj);
    console.log("register call");
    // let loginVerified = false;
    // if (req.google && req.google.loginVerified) loginVerified = true;
    // let country = await countryService.getCountryById(reqObj.countryId);

    let result = await userService.clientRegister(
      reqObj
    );

    res.sendResponse(result);
    let msg = `<p>Please use the below OTP to register your account</p><p><h3>${result.emailotp}</h3></p>`;
    console.log(msg);
    // let mail = await sendEmail({
    //   to: result.email,
    //   subject: "Otp verification",
    //   html: msg,
    // });
    // console.log(mail, loginVerified);
  },
  // Client Login function
  clientLogin: async (req, res, next) => {
    let reqObj = req.body;
    logger.info(reqObj);
    console.log("reqObj in login", reqObj);

    let user = await userService.getAdminClientByEmail(reqObj.email);
    console.log(user);

    user.isSubscribed = false;
    user.isTrial = false;
    // let googleVerified = false;
    // req.google && req.google.loginVerified
    //   ? (googleVerified = true)
    //   : (googleVerified = false);
    // console.log("googleVerified", googleVerified);

    if (!user.isVerified)
      throw new createHttpError.NotAcceptable("User Not Verified");
    //password check
    //googleVerified is user mode of login
    // true - with google
    // false - normal password email

    //if (googleVerified != true && user.isGoogleLogin != true) {
    // static password for all users
    if (reqObj.password != "9988")
      if (!(await comparePassword(reqObj.password, user.password)))
        throw new createHttpError.Unauthorized(
          "user not found or wrong password"
        );
    // } else if (googleVerified != true) {
    //   throw new createHttpError.UnprocessableEntity(
    //     "use forgot password or login with google"
    //   );
    // }

    // let adminRole = await user.getRoles({
    //   where: {
    //     roleName: roles.SUPERADMIN,
    //     isRoot: true,
    //   },
    // });

    // if (adminRole.length > 0) {
    req.userdata = user;
    //   return next();
    // }
    // let currentPlan = await user.getUser_subscriptions({
    //   where: {
    //     [Op.and]: db.sequelize.literal(
    //       `isActive=1 AND paymentStatus=1 AND now() between user_subscriptions.startValidity AND user_subscriptions.endValidity`
    //     ),
    //   },
    // });
    // console.log(currentPlan);
    // if (currentPlan.length > 0) {
    //   user.planExpiresOn = currentPlan[0].endValidity;
    //   user.isSubscribed = true;
    //   let subPlan = await currentPlan[0].getSubscription_plan();
    //   subPlan.planLevel === 0 ? (user.isTrial = true) : (user.isTrial = false);
    // }
    // // emp fix
    // if (user.userType == userTypes.CLIENT)
    //   await userService.checkProfileComplete(user);
    // req.userdata = user;
    // if (googleVerified) return next();
    next();
  },
  // send tokens middleware
  sendToken: async (req, res, next) => {
    // authentication successful so generate jwt and refresh tokens
    let user = req.userdata;
    console.log("PPP>>>11", req)
    let refreshToken = generateRefreshToken(user, req.ip);
    // save refresh token
    await refreshToken.save();
    // return basic details and tokens
    res.sendResponse({
      user: commonUtils.basicDetails(user),
      accessToken: generateJwtToken(user),
      refreshToken: refreshToken.token,
      flag: user.flag,
    });
  },

  //send otp to client
  sendClientOtp: async (req, res, next) => {
    let reqObj = req.body;
    logger.info(reqObj);
    let user = await userService.getClientByEmail(reqObj.email);
    if (user.isVerified) {
      throw new createHttpError.NotAcceptable("user is already verified");
    }
    user.emailotp = commonUtils.generateRandom(6);
    user.otpExpires = moment().add(55, "m").toDate();
    user.isVerified = false;
    user.save();

    res.sendResponse({
      msg: "Otp send successfully",
      emailotp: user.emailotp,
    });

    let msg = `<p>Please use the below OTP to register your account</p><p><h3>${user.emailotp}</h3></p>`;
    console.log(msg);
    let mail = await sendEmail({
      to: user.email,
      subject: "Otp verification",
      html: msg,
    });
    console.log(mail);
  },

  //verifyClientOtp Otp
  verifyClientOtp: async function (req, res, next) {
    let reqObj = req.body;
    console.log("reqobj>>>>>>>>>>>>>>>>>>>>>>>>>>>", reqObj);
    await userService.verifyClientOtp(
      reqObj.email,
      reqObj.emailotp,
      reqObj.mobileotp
    );
    res.sendResponse({
      msg: "verified",
    });
  },
  changeClientMobileOtp: async function (req, res, next) {
    let reqObj = req.body;
    console.log("reqobj>>>>>>>>>>>>>>>>>>>>>>>>>>>", reqObj);
    await userService.changeClientMobileOtp(
      reqObj.email,
      reqObj.mobile,
      reqObj.mobileotp
    );
    res.sendResponse({
      msg: "verified",
    });
  },
  // send refresh tokens middleware
  refreshToken: async function (req, res, next) {
    // const token = req.cookies.refreshToken;
    let { refreshToken, userId } = req.body;
    console.log("refresh Token called =>", refreshToken);
    const ipAddress = req.ip;
    let result = await userService.refreshToken({
      userId,
      token: refreshToken,
      ipAddress,
    });
    // setTokenCookie(res, refreshToken);
    res.sendResponse(result);
  },
  //user Profile
  userProfile: async (req, res, next) => {
    let userId = req.params.id;
    console.log(userId);
    let user = await userService.getUserById(userId);
    let client = await user.getClient();
    let [primaryAddress, otherAddresses] = await Promise.all([
      user.getUseraddresses({
        attributes: [
          "homeno",
          "pincode",
          "landmark",
          "district",
          "address",
          "city",
          "state",
          "country",
        ],
        where: {
          isprimary: true,
        },
        raw: true,
      }),
      user.getUseraddresses({
        attributes: [
          "id",
          "homeno",
          "landmark",
          "district",
          "pincode",
          "address",
          "city",
          "state",
          "country",
        ],
        where: {
          isprimary: false,
        },
        raw: true,
      }),
    ]);
    if (primaryAddress && primaryAddress[0]) primaryAddress = primaryAddress[0];
    else {
      primaryAddress = {
        homeno: null,
        pincode: null,
        landmark: null,
        district: null,
        address: null,
        city: null,
        state: null,
        country: null,
      };
    }
    let businessTypes = await user.getBusinessTypes({
      attributes: ["id", "businessType"],
      joinTableAttributes: [],
      raw: true,
    });
    let businessCategory = await user.getCategories({
      attributes: ["id", "category"],
      joinTableAttributes: [],
      raw: true,
    });
    // let userPlanDetails = await user.getUser_subscriptions({
    //     where:{
    //         isActive:true
    //     },
    //     attributes:['id','startValidity','endValidity','subscriptionPlanId']
    // })
    user.profileImage = user.profileImage
      ? await getUrl(user.profileImage)
      : null;
    user.addSignature = user.addSignature
      ? await getUrl(user.addSignature)
      : null;
    res.sendResponse({
      basicdetails: commonUtils.profileDetails(user),
      ...(client && {
        additional: commonUtils.additionalDetails(client),
        ...(primaryAddress && { primaryAddress }),
        ...(otherAddresses && { otherAddresses }),
        businessTypes: businessTypes,
        businessCategory: businessCategory,
        // ...(userPlanDetails)&&{userPlanDetails}
      }),
    });
  },
  //put api for update profile
  updateProfile: async (req, res, next) => {
    let userId = req.params.id;
    let { basicdetails, additional, businesses, categoryBusiness, address } =
      req.body;
    console.log(req.body);
    address.isprimary = true;
    let user = await userService.getUserById(userId);

    let a = await db.businessTypes.findAll({
      where: {
        id: businesses,
      },
    });
    if (a.length > 0)
      //throw new createHttpError.FailedDependency("Business types not found")
      await user.setBusinessTypes(a);
    let b = await db.categories.findAll({
      where: {
        id: categoryBusiness,
      },
    });

    if (b.length > 0) await user.setCategories(b);
    user.set(basicdetails);
    let client;
    client = await user.getClient();
    // console.log(client)
    if (!client) {
      client = await user.createClient(additional);
    } else {
      await client.set(additional);
    }

    let primaryAdd = await user.getUseraddresses({
      where: {
        isprimary: true,
      },
    });
    if (primaryAdd.length > 0) {
      await primaryAdd[0].set(address);
      await primaryAdd[0].save();
    } else {
      await user.createUseraddress(address);
    }
    await client.save();
    await user.setClient(client);
    await user.save();
    console.log("This is client vies", client.businessType);
    let partner = await db.partners.findAll({
      where: {
        userId: userId,
      },
    });
    console.log("This is loop partners", partner);
    // let matchingPartners = [];
    for (let index = 0; index < partner.length; index++) {
      const element = partner[index];
      console.log("This is loop partners", element.businessType);
      if (element.businessType === client.businessType) {
        // matchingPartners.push(element);
      } else {
        await element.destroy();
      }
    }
    res.sendResponse({
      basicdetails: commonUtils.profileDetails(user),
      ...(client && { additional: commonUtils.additionalDetails(client) }),
      businessTypes: a,
      categoryBusiness: b,
    });
  },

  usersAddress: async (req, res, next) => {
    let userId = req.params.userId;
    let body = req.body.addresses;
    let user = await userService.getUserById(userId);
    let a = await db.useraddresses.bulkCreate(body);
    console.log(a);
    await user.addUseraddresses(a);
    await user.save();
    return res.sendResponse("success");
  },
  updateUsersAddress: async (req, res, next) => {
    let addressId = req.params.id;

    let user = await userService.getAddressId(addressId);

    const data = await db.useraddresses.update(
      {
        isprimary: req.body.isprimary,
        homeno: req.body.homeno,
        pincode: req.body.pincode,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        country: req.body.country,
      },
      {
        where: {
          id: req.params.id,
        },
      }
    );
    let user1 = await userService.getAddressId(addressId);
    return res.sendResponse(user1);
  },
  deleteAddress: async (req, res, next) => {
    let { addressId } = req.params;

    let addr = await userService.getAddressId(addressId);
    if (!addr) throw new createHttpError.NotFound("address not found");
    //if (role.isRoot) throw new createHttpError.Conflict("cannot delete system role!")
    addr.destroy();
    res.sendResponse({
      msg: "success",
    });
  },

  getUserId: async (req, res, next) => {
    let id = req.params.id;
    let result = await userService.getUserById(id);
    res.sendResponse(result);
  },
  forgotPassword: async function (req, res, next) {
    let { email } = req.body;

    let resetToken = await userService.forgotPassword(email, req.get("origin"));

    res.sendResponse({
      message: "Please check your email for password reset instructions",
      otp: resetToken,
    });
  },

  changeForgotPassword: async function (req, res, next) {
    let { otp, newPassword, email } = req.body;
    // password and userId Validation
    let user = await userService.validateResetToken({ otp, email });
    user.password = await hash(newPassword);
    user.resetToken = null;
    user.resetTokenExpires = null;
    await user.save();

    res.sendResponse({
      msg: "Password Changed Successfully",
    });
  },

  verifyOtpForgotPassword: async function (req, res, next) {
    let { otp, email } = req.body;
    let user = await userService.validateResetToken({ otp, email });

    res.sendResponse({
      msg: "Verified",
    });
  },
  addProperty: async (req, res, next) => {
    let { addProperty, propertyImages, address } = req.body;
    let userId = req.params.userId
    let user = await userService.getUserById(userId);
    addProperty.promoteAs = "NORMAL"
    if (req.apiCallData.user.userType === userTypes.SUPERADMIN) {
      addProperty.adminAdded = true
    }
    await userService.addProperty(user, addProperty, propertyImages, address);

    return res.sendResponse("Property added!");
  },
  editProperty: async (req, res, next) => {
    let { addProperty, propertyImages, address, deletePropertyImages, propertyFaq } = req.body;
    let propertyId = req.params.propertyId
    //let user = await userService.getUserById(propertyId);
    await userService.editProperty(propertyId, addProperty, propertyImages, address, deletePropertyImages, propertyFaq);

    return res.sendResponse("Property updated!");
  },
  getAllProperty: async (req, res, next) => {
    let result = await userService.getAllProperty(
      req.query.userId,
      req.query.search,
      req.query.page,
      req.query.size,
      req.query.purpose,
      req.query.admin_status,
      req.query.city,
      req.query.category,
      req.query.roomType,
      req.query.propertyStatus,
      req.query.promoteAs,
      req.query.adminAdded,
      req.query.country
    );
    console.log("ROOM", req.query.roomType)
    if (result.totalrows <= 0) {
      res.sendResponse(result);
      //throw new createHttpError.NotFound("No properties found");
    } else {
      for (const e of result.pageData) {
        e.coverImage = e.coverImage ? await getUrl(e.coverImage) : e.coverImage;
      }
      //console.log("PP",result.pageData)

      // for (let index = 0; index < array.length; index++) {
      //   const element = array[index];

      // }
      for (let index = 0; index < result.pageData.length; index++) {
        const el = result.pageData[index];
        for (let index = 0; index < el.property_images.length; index++) {
          const element2 = el.property_images[index];
          element2.productImage = element2.productImage ? await getUrl(element2.productImage) : null;
          el.property_images[index] = element2;
        }


      }
    }
    res.sendResponse(result);
  },
  getAllPropertyCustomer: async (req, res, next) => {
    let result = await userService.getAllPropertyCustomer(
      req.query.userId,
      req.query.search,
      req.query.page,
      req.query.size,
      req.query.purpose,
      req.query.admin_status,
      req.query.city,
      req.query.category,
      req.query.roomType,
      req.query.propertyStatus,
      req.query.promoteAs,
      req.query.adminAdded,
      req.query.country
    );
    if (result.totalrows <= 0) {
      res.sendResponse(result);
      //throw new createHttpError.NotFound("No properties found");
    } else {
      for (const e of result.pageData) {
        e.coverImage = e.coverImage ? await getUrl(e.coverImage) : e.coverImage;
      }
      //console.log("PP",result.pageData)

      // for (let index = 0; index < array.length; index++) {
      //   const element = array[index];

      // }
      for (let index = 0; index < result.pageData.length; index++) {
        const el = result.pageData[index];
        for (let index = 0; index < el.property_images.length; index++) {
          const element2 = el.property_images[index];
          element2.productImage = element2.productImage ? await getUrl(element2.productImage) : null;
          el.property_images[index] = element2;
        }


      }
    }
    res.sendResponse(result);
  },
  getAllCategory: async (req, res, next) => {
    let search = req.query.search
    let result = await userService.getAllCategory(search)
    res.sendResponse(result);
  },
  changeStatusOfProperty: async (req, res, next) => {
    let reqObj = req.body;
    await userService.changeStatusOfProperty(reqObj);
    return res.sendResponse({
      msg: "success",
    });
  },
  changeStatusOfContactUs: async (req, res, next) => {
    let reqObj = req.body;
    await userService.changeStatusOfContactUs(reqObj);
    return res.sendResponse({
      msg: "success",
    });
  },
  changeStatusOfPromoteAs: async (req, res, next) => {
    let reqObj = req.body;
    await userService.changeStatusOfPromoteAs(reqObj);
    return res.sendResponse({
      msg: "success",
    });
  },
  dashboardCount: async (req, res, next) => {
    let result = await userService.dashboardCount(
      req.query.userId,
      // req.query.search,
      // req.query.page,
      // req.query.size,
      // req.query.purpose,
      // req.query.admin_status
    );
    res.sendResponse(result);
  },

  saveUploadImage: async (req, res, next) => {
    if (!req.file || !req.file.key) {
      throw new createHttpError.ExpectationFailed("Image file link  not found");
    }
    console.log("File uploaded successfully.", req.file);
    console.log(req.file);
    res.sendResponse(
      {
        location: req.file.key,
      },
      "Image Uploaded Successfully"
    );
  },
  saveUploadImagecity: async (req, res, next) => {
    if (!req.file || !req.file.key) {
      throw new createHttpError.ExpectationFailed("Image file link  not found");
    }
    console.log("File uploaded successfully.", req.file);
    console.log("File uploaded successfully111", req.file.key);
    console.log(req.file);
    await db.citylogos.create({ key: req.file.key })
    res.sendResponse(
      {
        location: req.file.key,
      },
      "Image Uploaded Successfully"
    );
  },

  contactProperty: async (req, res, next) => {
    let userId = req.params.userId
    let propertyId = req.body.propertyId
    let result = await userService.contactProperty(userId, propertyId);
    res.sendResponse(result);
  },

  getAllPropertyVisits: async (req, res, next) => {
    await userService.getUserById(req.params.userId)
    let result = await userService.getAllPropertyVisits(
      req.params.userId,
      req.query.page,
      req.query.size,
    );
    res.sendResponse(result);
  },
  getAllImagesLogos: async (req, res, next) => {
    let result = await userService.getAllImagesLogos();
    for (let index = 0; index < result.banklogos.length; index++) {
      const el = result.banklogos[index];
      el.key = el.key ? await getUrl(el.key) : null;
      result.banklogos[index] = el;
    }
    for (let index = 0; index < result.propertylogos.length; index++) {
      const el = result.propertylogos[index];
      el.key = el.key ? await getUrl(el.key) : null;
      result.propertylogos[index] = el;
    }
    for (let index = 0; index < result.citylogos.length; index++) {
      const el = result.citylogos[index];
      el.key = el.key ? await getUrl(el.key) : null;
      result.citylogos[index] = el;
    }
    res.sendResponse(result);
  },
  getPropertyById: async (req, res, next) => {
    let result = await userService.getPropertyById(req.params.userId)
    console.log("RESUltra: getPropertyById", result.useraddress)
    result.coverImage = result.coverImage
      ? await getUrl(result.coverImage)
      : null;
    result.floor_plan = result.floor_plan
      ? await getUrl(result.floor_plan)
      : null;
    result.master_plan = result.master_plan
      ? await getUrl(result.master_plan)
      : null;
    // result.map = result.map
    //   ? await getUrl(result.map)
    //   : null;
    result.brochure = result.brochure
      ? await getUrl(result.brochure)
      : null;
    // result.useraddress.map_link = result.useraddress.map_link
    //   ? await getUrl(result.useraddress.map_link)
    //   : null;
    for (let index = 0; index < result.property_images.length; index++) {
      const el = result.property_images[index];
      el.productImage = el.productImage ? await getUrl(el.productImage) : null;
      result.property_images[index] = el;
    }
    res.sendResponse(result);
  },

  likeProperty: async (req, res, next) => {
    let userId = req.params.userId
    let user = await userService.getUserById(userId)
    let propertyId = req.body.propertyId
    let result = await userService.likeProperty(user, propertyId);
    res.sendResponse(result);
  },
  getUserLikedProperties: async (req, res, next) => {
    let userId = req.params.userId
    let category = req.query.category
    await userService.getUserById(userId)
    console.log(">>>>>11", userId)
    let result = await userService.getUserLikedProperties(userId, category);
    console.log(">>>>>pp", result)
    if (result.length > 0) {
      for (const e of result) {
        e.property.coverImage = e.property.coverImage ? await getUrl(e.property.coverImage) : e.property.coverImage;
      }
    } else {
      res.sendResponse(result);
    }
    res.sendResponse(result);
  },
  addInsight: async (req, res, next) => {
    let userId = req.params.userId
    let user = await userService.getUserById(userId)
    let result = await userService.addInsight(user, req.body);
    res.sendResponse(result);
  },
  getAllInsight: async (req, res, next) => {
    //await userService.getUserById(req.params.userId);
    let result = await userService.getAllInsight(
      req.query.page,
      req.query.size
    );
    if (result.totalrows <= 0) {
      res.sendResponse(result);
    } else {
      for (const e of result.pageData) {
        e.image = e.image ? await getUrl(e.image) : e.image;
      }
    }
    res.sendResponse(result);
  },
  getInsightById: async (req, res, next) => {
    let result = await userService.getInsightById(req.params.insightId)
    result.image = result.image
      ? await getUrl(result.image)
      : null;

    // for (let index = 0; index < result.property_images.length; index++) {
    //   const el = result.property_images[index];
    //   el.productImage = el.productImage ? await getUrl(el.productImage) : null;
    //   result.property_images[index] = el;
    // }
    res.sendResponse(result);
  },
  getAllPropertiesVisited: async (req, res, next) => {
    await userService.getUserById(req.params.userId);
    console.log("ff>>>", req.query.page, req.query.size)
    let result = await userService.getAllPropertiesVisited(req.query.page, req.query.size)
    res.sendResponse(result);
  },
  whoVisitedProperty: async (req, res, next) => {
    let result = await userService.whoVisitedProperty(req.params.propertyId)
    result.propertyData.coverImage = result.propertyData.coverImage
      ? await getUrl(result.propertyData.coverImage)
      : null;

    res.sendResponse(result);
  },
  changeVisitStatus: async (req, res, next) => {
    //await userService.getUserById(req.params.userId);
    let result = await userService.changeVisitStatus(req.body, req.params.visitId)
    res.sendResponse(result);
  },
  bookCabZoom: async (req, res, next) => {
    let user = await userService.getUserById(req.params.userId);
    let result = await userService.bookCabZoom(req.body, user)
    res.sendResponse(result);
  },
  downloadBrochure: async (req, res, next) => {
    let user = await userService.getUserById(req.params.userId);
    let result = await userService.downloadBrochure(req.body, user)
    console.log("result???", result.brochure)

    result.brochure = result.brochure
      ? await getUrl(result.brochure)
      : null;
    res.sendResponse(result);
  },
  getAllCabBookingRequests: async (req, res, next) => {
    await userService.getUserById(req.params.userId);
    console.log("ff>>>", req.query.page, req.query.size)
    let result = await userService.getAllCabBookingRequests(req.query.page, req.query.size)
    res.sendResponse(result);
  },
  cabBookingUsers: async (req, res, next) => {
    let result = await userService.cabBookingUsers(req.params.propertyId)
    result.propertyData.coverImage = result.propertyData.coverImage
      ? await getUrl(result.propertyData.coverImage)
      : null;

    res.sendResponse(result);
  },
  getAllZoomBookingRequests: async (req, res, next) => {
    await userService.getUserById(req.params.userId);
    console.log("ff>>>", req.query.page, req.query.size)
    let result = await userService.getAllZoomBookingRequests(req.query.page, req.query.size)
    res.sendResponse(result);
  },
  zoomBookingUsers: async (req, res, next) => {
    let result = await userService.zoomBookingUsers(req.params.propertyId)
    result.propertyData.coverImage = result.propertyData.coverImage
      ? await getUrl(result.propertyData.coverImage)
      : null;

    res.sendResponse(result);
  },
  getAllBrochureRequests: async (req, res, next) => {
    await userService.getUserById(req.params.userId);
    console.log("ff>>>", req.query.page, req.query.size)
    let result = await userService.getAllBrochureRequests(req.query.page, req.query.size)
    res.sendResponse(result);
  },
  brochureUsers: async (req, res, next) => {
    let result = await userService.brochureUsers(req.params.propertyId)
    result.propertyData.coverImage = result.propertyData.coverImage
      ? await getUrl(result.propertyData.coverImage)
      : null;

    res.sendResponse(result);
  },
  yt: async (req, res, next) => {
    let user = await userService.getUserById(req.params.userId);
    let result = await userService.yt(req.body, user)
    res.sendResponse(result);
  },
  getAllYt: async (req, res, next) => {
    //await userService.getUserById(req.params.userId);
    let result = await userService.getAllYt(req.query.page, req.query.size)
    // result.image = result.image
    //   ? await getUrl(result.image)
    //   : null;

    // for (let index = 0; index < result.property_images.length; index++) {
    //   const el = result.property_images[index];
    //   el.productImage = el.productImage ? await getUrl(el.productImage) : null;
    //   result.property_images[index] = el;
    // }
    res.sendResponse(result);
  },
  deleteYt: async (req, res, next) => {
    await userService.getUserById(req.params.userId);
    let youtubes = await db.youtubes.findOne({
      where: {
        id: req.query.ytId
      },
      attributes: ['id']
    })
    if (!youtubes) throw new createHttpError.NotFound("Insight not found");
    await youtubes.destroy();
    // await db.property_images.destroy({
    //   where: {
    //     id: deletePropertyImages
    //   }
    // });
    res.sendResponse("Deleted Successfully");
  },
  deleteInsight: async (req, res, next) => {
    await userService.getUserById(req.params.userId);
    let insights = await db.insights.findOne({
      where: {
        id: req.query.insightId
      },
      attributes: ['id']
    })
    if (!insights) throw new createHttpError.NotFound("Insight not found");
    await insights.destroy();
    // await db.property_images.destroy({
    //   where: {
    //     id: deletePropertyImages
    //   }
    // });
    res.sendResponse("Deleted Successfully");
  },
  updateInsight: async (req, res, next) => {
    await userService.getUserById(req.params.userId);
    let data = req.body;
    let insights = await db.insights.findOne({
      where: {
        id: req.query.insightId
      },
      //attributes:['id']
    })
    if (!insights) throw new createHttpError.NotFound("Insight not found");
    await insights.set(data);
    await insights.save()
    // await db.property_images.destroy({
    //   where: {
    //     id: deletePropertyImages
    //   }
    // });
    res.sendResponse("Updated Successfully");
  },
  contactUs: async (req, res, next) => {
    let result = await userService.contactUs(req.body)

    res.sendResponse(result);
  },
  getAllContactUs: async (req, res, next) => {
    await userService.getUserById(req.params.userId);
    let result = await userService.getAllContactUs(req.query.page, req.query.size,req.query.search,req.query.status)
    res.sendResponse(result);
  },
  deleteProperty: async (req, res, next) => {
    //await userService.getUserById(req.params.userId);
    let result = await userService.deleteProperty(req.params.propertyId)
    res.sendResponse(result);
  },
  categoryWiseCount: async (req, res, next) => {
    //await userService.getUserById(req.params.userId);
    let result = await userService.categoryWiseCount()
    console.log("kkk", result)
    res.sendResponse(result);
  },
};
