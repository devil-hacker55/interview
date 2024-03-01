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
  "/addProperty",
  //NewverifyUser([userTypes.CLIENT], permissions.PRODUCTS, accessLevel.CREATE),
  //goodsValidate.goodsValidateSchema,
  PromiseHandler(userController.addProperty)
);

router.get(
  "/getAllProperty",
  //NewverifyUser([userTypes.CLIENT], permissions.PRODUCTS, accessLevel.CREATE),
  //goodsValidate.goodsValidateSchema,
  PromiseHandler(userController.getAllProperty)
);
router.put(
  "/changeStatusOfProperty",
  //NewverifyUser([userTypes.CLIENT], permissions.SALES, accessLevel.CREATE),
  //salesInvoicesValidate.changeStatusOfProperty,
  PromiseHandler(userController.changeStatusOfProperty)
);
module.exports = router;
