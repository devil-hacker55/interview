"use strict";
/**
 * this module is used to define index routes(ALL)
 * @module users.routes
 * @author #
 * @version 1.0
 */

/**
 *  import project modules
 */

const express = require("express");
const router = express.Router();
const { PromiseHandler } = require("../middleware/error.handler");
const userController = require("../controllers/users.controller");
const authorizeNew = require('../middleware/auth')
const { permissions, accessLevel, userTypes } = require('../utils/strings');
const { imageUpload, deleteFile } = require("../helpers/aws-s3");
const fs = require("fs");
const path = require("path");

router.get("/", (req, res) =>
  res.status(200).send({ data: "welcome to users routes" })
);


// CLIENT APIS
router.post(
  "/clientRegister",
  PromiseHandler(userController.clientRegister)
);

router.post(
  "/sendClientOtp",
  PromiseHandler(userController.sendClientOtp)
);

router.post(
  "/verifyClientOTP",
  PromiseHandler(userController.verifyClientOtp)
);

router.post(
  "/changeClientMobileOtp",
  PromiseHandler(userController.changeClientMobileOtp)
);

router.post(
  "/clientLogin",
  PromiseHandler(userController.clientLogin),
  PromiseHandler(userController.sendToken)
);

router.post(
  "/addProperty/:userId",
  authorizeNew([userTypes.CLIENT, userTypes.SUPERADMIN, userTypes.CUSTOMER]),
  //goodsValidate.goodsValidateSchema,
  PromiseHandler(userController.addProperty)
);

router.put(
  "/admin/editProperty/:propertyId",
  authorizeNew([userTypes.CLIENT, userTypes.SUPERADMIN, userTypes.CUSTOMER]),
  //goodsValidate.goodsValidateSchema,
  PromiseHandler(userController.editProperty)
);

router.get(
  "/getAllCategory",
  authorizeNew([userTypes.CLIENT, userTypes.SUPERADMIN, userTypes.CUSTOMER]),
  //goodsValidate.goodsValidateSchema,
  PromiseHandler(userController.getAllCategory)
);

router.get(
  "/getAllProperty",
  //authorizeNew([userTypes.CLIENT,userTypes.SUPERADMIN, userTypes.CUSTOMER]),
  //goodsValidate.goodsValidateSchema,
  PromiseHandler(userController.getAllProperty)
);

router.get(
  "/customer/getAllProperty",
  //authorizeNew([userTypes.CLIENT,userTypes.SUPERADMIN, userTypes.CUSTOMER]),
  //goodsValidate.goodsValidateSchema,
  PromiseHandler(userController.getAllPropertyCustomer)
);
router.put(
  "/changeStatusOfProperty",
  authorizeNew([userTypes.CLIENT, userTypes.SUPERADMIN]),
  //salesInvoicesValidate.changeStatusOfProperty,
  PromiseHandler(userController.changeStatusOfProperty)
);

router.put(
  "/changeStatusOfPromoteAs",
  authorizeNew([userTypes.CLIENT, userTypes.SUPERADMIN]),
  //salesInvoicesValidate.changeStatusOfProperty,
  PromiseHandler(userController.changeStatusOfPromoteAs)
);

router.get(
  "/dashboardCount",
  authorizeNew([userTypes.CLIENT, userTypes.SUPERADMIN, userTypes.CUSTOMER]),
  //goodsValidate.goodsValidateSchema,
  PromiseHandler(userController.dashboardCount)
);

router.post(
  "/uploadImage",
  imageUpload,
  PromiseHandler(userController.saveUploadImage)
);
router.post(
  "/uploadImagecity",
  imageUpload,
  PromiseHandler(userController.saveUploadImagecity)
);

router.post(
  "/contactProperty/:userId",
  authorizeNew([userTypes.CLIENT, userTypes.SUPERADMIN, userTypes.CUSTOMER]),
  //goodsValidate.goodsValidateSchema,
  PromiseHandler(userController.contactProperty)
);

router.get(
  "/getAllPropertyVisits/:userId",
  authorizeNew([userTypes.CLIENT, userTypes.SUPERADMIN, userTypes.CUSTOMER]),
  //goodsValidate.goodsValidateSchema,
  PromiseHandler(userController.getAllPropertyVisits)
);
router.get(
  "/getAllImagesLogos",
  //authorizeNew([userTypes.CLIENT, userTypes.SUPERADMIN, userTypes.CUSTOMER]),
  //goodsValidate.goodsValidateSchema,
  PromiseHandler(userController.getAllImagesLogos)
);
router.get(
  "/getPropertyById/:userId",
  //authorizeNew([userTypes.CLIENT,userTypes.SUPERADMIN, userTypes.CUSTOMER]),
  //goodsValidate.goodsValidateSchema,
  PromiseHandler(userController.getPropertyById)
);

router.post(
  "/likeProperty/:userId",
  authorizeNew([userTypes.CLIENT, userTypes.SUPERADMIN, userTypes.CUSTOMER]),
  //goodsValidate.goodsValidateSchema,
  PromiseHandler(userController.likeProperty)
);

router.get(
  "/getUserLikedProperties/:userId",
  authorizeNew([userTypes.CLIENT, userTypes.SUPERADMIN, userTypes.CUSTOMER]),
  //goodsValidate.goodsValidateSchema,
  PromiseHandler(userController.getUserLikedProperties)
);

router.post(
  "/addInsight/:userId",
  authorizeNew([userTypes.SUPERADMIN]),
  //goodsValidate.goodsValidateSchema,
  PromiseHandler(userController.addInsight)
);

router.get(
  "/getAllInsight",
  //authorizeNew([userTypes.CLIENT, userTypes.SUPERADMIN, userTypes.CUSTOMER]),
  //goodsValidate.goodsValidateSchema,
  PromiseHandler(userController.getAllInsight)
);
router.get(
  "/getInsightById/:insightId",
  //authorizeNew([userTypes.CLIENT, userTypes.SUPERADMIN, userTypes.CUSTOMER]),
  //goodsValidate.goodsValidateSchema,
  PromiseHandler(userController.getInsightById)
);

router.get(
  "/admin/getAllPropertiesVisited/:userId",
  authorizeNew([userTypes.CLIENT, userTypes.SUPERADMIN, userTypes.CUSTOMER]),
  //goodsValidate.goodsValidateSchema,
  PromiseHandler(userController.getAllPropertiesVisited)
);
router.get(
  "/admin/whoVisitedProperty/:propertyId",
  authorizeNew([userTypes.CLIENT, userTypes.SUPERADMIN, userTypes.CUSTOMER]),
  //goodsValidate.goodsValidateSchema,
  PromiseHandler(userController.whoVisitedProperty)
);
router.post(
  "/admin/changeVisitStatus/:visitId",
  authorizeNew([userTypes.CLIENT, userTypes.SUPERADMIN, userTypes.CUSTOMER]),
  //goodsValidate.goodsValidateSchema,
  PromiseHandler(userController.changeVisitStatus)
);

router.post(
  "/bookCabZoom/:userId",
  authorizeNew([userTypes.CLIENT, userTypes.SUPERADMIN, userTypes.CUSTOMER]),
  //goodsValidate.goodsValidateSchema,
  PromiseHandler(userController.bookCabZoom)
);

router.post(
  "/downloadBrochure/:userId",
  authorizeNew([userTypes.CLIENT, userTypes.SUPERADMIN, userTypes.CUSTOMER]),
  //goodsValidate.goodsValidateSchema,
  PromiseHandler(userController.downloadBrochure)
);

router.get(
  "/admin/getAllCabBookingRequests/:userId",
  authorizeNew([userTypes.CLIENT, userTypes.SUPERADMIN, userTypes.CUSTOMER]),
  //goodsValidate.goodsValidateSchema,
  PromiseHandler(userController.getAllCabBookingRequests)
);
router.get(
  "/admin/cabBookingUsers/:propertyId",
  authorizeNew([userTypes.CLIENT, userTypes.SUPERADMIN, userTypes.CUSTOMER]),
  //goodsValidate.goodsValidateSchema,
  PromiseHandler(userController.cabBookingUsers)
);

router.get(
  "/admin/getAllZoomBookingRequests/:userId",
  authorizeNew([userTypes.CLIENT, userTypes.SUPERADMIN, userTypes.CUSTOMER]),
  //goodsValidate.goodsValidateSchema,
  PromiseHandler(userController.getAllZoomBookingRequests)
);
router.get(
  "/admin/zoomBookingUsers/:propertyId",
  authorizeNew([userTypes.CLIENT, userTypes.SUPERADMIN, userTypes.CUSTOMER]),
  //goodsValidate.goodsValidateSchema,
  PromiseHandler(userController.zoomBookingUsers)
);

router.get(
  "/admin/getAllBrochureRequests/:userId",
  authorizeNew([userTypes.CLIENT, userTypes.SUPERADMIN, userTypes.CUSTOMER]),
  //goodsValidate.goodsValidateSchema,
  PromiseHandler(userController.getAllBrochureRequests)
);
router.get(
  "/admin/brochureUsers/:propertyId",
  authorizeNew([userTypes.CLIENT, userTypes.SUPERADMIN, userTypes.CUSTOMER]),
  //goodsValidate.goodsValidateSchema,
  PromiseHandler(userController.brochureUsers)
);
router.post(
  "/admin/yt/:userId",
  authorizeNew([ userTypes.SUPERADMIN]),
  //goodsValidate.goodsValidateSchema,
  PromiseHandler(userController.yt)
);
router.get(
  "/admin/getAllYt",
  //authorizeNew([ userTypes.SUPERADMIN,userTypes.CLIENT]),
  //goodsValidate.goodsValidateSchema,
  PromiseHandler(userController.getAllYt)
);
router.post(
  "/contactUs",
  //authorizeNew([ userTypes.SUPERADMIN,userTypes.CLIENT]),
  //goodsValidate.goodsValidateSchema,
  PromiseHandler(userController.contactUs)
);
router.get(
  "/admin/getAllContactUs/:userId",
  authorizeNew([ userTypes.SUPERADMIN,userTypes.CLIENT]),
  //goodsValidate.goodsValidateSchema,
  PromiseHandler(userController.getAllContactUs)
);
router.put(
  "/admin/changeStatusOfContactUs/:userId",
  authorizeNew([ userTypes.SUPERADMIN,userTypes.CLIENT]),
  //goodsValidate.goodsValidateSchema,
  PromiseHandler(userController.changeStatusOfContactUs)
);
router.delete(
  "/admin/deleteProperty/:propertyId",
  authorizeNew([ userTypes.SUPERADMIN,userTypes.CLIENT]),
  //goodsValidate.goodsValidateSchema,
  PromiseHandler(userController.deleteProperty)
);
router.get(
  "/categoryWiseCount",
  authorizeNew([ userTypes.SUPERADMIN,userTypes.CLIENT]),
  //goodsValidate.goodsValidateSchema,
  PromiseHandler(userController.categoryWiseCount)
);
module.exports = router;
