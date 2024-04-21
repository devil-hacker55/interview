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
  authorizeNew([userTypes.CLIENT,userTypes.SUPERADMIN, userTypes.CUSTOMER]),
  //goodsValidate.goodsValidateSchema,
  PromiseHandler(userController.addProperty)
);

router.get(
  "/getAllCategory",
  authorizeNew([userTypes.CLIENT,userTypes.SUPERADMIN, userTypes.CUSTOMER]),
  //goodsValidate.goodsValidateSchema,
  PromiseHandler(userController.getAllCategory)
);

router.get(
  "/getAllProperty",
  //authorizeNew([userTypes.CLIENT,userTypes.SUPERADMIN, userTypes.CUSTOMER]),
  //goodsValidate.goodsValidateSchema,
  PromiseHandler(userController.getAllProperty)
);
router.put(
  "/changeStatusOfProperty",
  authorizeNew([userTypes.CLIENT,userTypes.SUPERADMIN, userTypes.CUSTOMER]),
  //salesInvoicesValidate.changeStatusOfProperty,
  PromiseHandler(userController.changeStatusOfProperty)
);

router.get(
  "/dashboardCount",
  authorizeNew([userTypes.CLIENT,userTypes.SUPERADMIN, userTypes.CUSTOMER]),
  //goodsValidate.goodsValidateSchema,
  PromiseHandler(userController.dashboardCount)
);

router.post(
  "/uploadImage",
  imageUpload,
  PromiseHandler(userController.saveUploadImage)
);

router.post(
  "/contactProperty/:userId",
  authorizeNew([userTypes.CLIENT,userTypes.SUPERADMIN, userTypes.CUSTOMER]),
  //goodsValidate.goodsValidateSchema,
  PromiseHandler(userController.contactProperty)
);

router.get(
  "/getAllPropertyVisits/:userId",
  authorizeNew([userTypes.CLIENT,userTypes.SUPERADMIN, userTypes.CUSTOMER]),
  //goodsValidate.goodsValidateSchema,
  PromiseHandler(userController.getAllPropertyVisits)
);
router.get(
  "/getPropertyById/:userId",
  //authorizeNew([userTypes.CLIENT,userTypes.SUPERADMIN, userTypes.CUSTOMER]),
  //goodsValidate.goodsValidateSchema,
  PromiseHandler(userController.getPropertyById)
);

router.post(
  "/likeProperty/:userId",
  authorizeNew([userTypes.CLIENT,userTypes.SUPERADMIN, userTypes.CUSTOMER]),
  //goodsValidate.goodsValidateSchema,
  PromiseHandler(userController.likeProperty)
);

router.get(
  "/getUserLikedProperties/:userId",
  authorizeNew([userTypes.CLIENT,userTypes.SUPERADMIN, userTypes.CUSTOMER]),
  //goodsValidate.goodsValidateSchema,
  PromiseHandler(userController.getUserLikedProperties)
);
module.exports = router;
