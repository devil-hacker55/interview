"use strict";
/**
 * this module is used to define index routes(ALL)
 * @module index.routes
 * @author #
 * @version 1.0
 */

/**
*  import project modules
*/

const express = require('express');
const router = express.Router();
const { PromiseHandler } = require('../utils/commonUtils');

router.get('/', (req, res) => res.status(200).send({ data: "welcome" }));

router.use('/users', require('./users.routes'));

module.exports = router