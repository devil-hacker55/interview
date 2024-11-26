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

const interviewService = require("../services/interview.service");

module.exports = {
  // interview route, this will return the product list
  getProducts: async (req, res, next) => {
    let { search, page, size, orderBy, orderDir } = req.query;
    let searchFields = req.body.searchFields
    //console.log(reqObj)
    if (!page) {
      page = 1;
    }
    if (!size) {
      size = 10
    }
    if (!orderBy) {
      orderBy = "createdAt"
    }
    if (!orderDir) {
      orderDir = "desc"
    }


    // if(searchFields.length>0){
    //   for (let index = 0; index < searchFields.length; index++) {
    //     const element = searchFields[index];console.log(element)
    //     console.log("check",element)
    //   }
    // }
    let result = await interviewService.getProducts(
      search, page, size, orderBy, orderDir
    );
    res.sendResponse(result);
  },

  postProducts: async (req, res, next) => {
    let reqObj = req.body.prodData;
    let result = await interviewService.postProducts(
      reqObj
    );
    res.sendResponse(result);
  },
};
