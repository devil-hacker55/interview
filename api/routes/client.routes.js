"use strict";
/**
 * this module is used to define permissions routes(ALL)
 * @module client.routes
 * @author #
 * @version 1.0
 */

/**
*  import project modules
*/
const express = require('express');
const router = express.Router();
//const authorize = require('../middleware/authorize')
const authorizeNew = require('../middleware/authorizenew')
//const customerAuthorize = require('../middleware/customerAuthorize')
//const ytd = require('../middleware/checkPermission')
const { PromiseHandler } = require('../middleware/error.handler')
const { accessLevel, permissions ,userTypes} = require('../utils/strings');
//const clientController = require('../controllers/client.controller');

module.exports = router