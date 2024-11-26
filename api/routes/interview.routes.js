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
const interviewController = require("../controllers/interview.controller");

router.get("/", (req, res) =>
  res.status(200).send({ data: "welcome to users routes" })
);


//interview api for get products
router.get(
  "/interview/getProducts",
  PromiseHandler(interviewController.getProducts)
);

router.post(
    "/interview/postProducts",
    PromiseHandler(interviewController.postProducts)
  );
  

module.exports = router;
