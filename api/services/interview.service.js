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



module.exports = {
  getProducts: async (search, page, size, orderBy, orderDir) => {

    console.log("dataObj", search, page, size, orderBy)
    let data = await db.products.findAll({
      where: {
        //   ...(search, {
        //     productName: search
        //   }
        // )


        //i forgot the syntax for speard operator


        [Op.and]: {
          [Op.or]: {
            productName: {
              [Op.like]: `%${search}%`
            },
            description: {
              [Op.like]: `%${search}%`
            }
          }
        }

      },
      //we can include multiple tables here 

      // include: [
      //   {
      //     model: db.vendorInfo
      //   },
      //   {
      //     model: db.organisationInfo
      //   }
      // ]
      attributes: [
        "id", "productId", "productName", "description", "price", "currency", "category", "subCategory", "productCode", "productType", "images", "imagesUrl", "moreDetails", "features", "benefits", "specifications", "organizationId", "status", "brandName", "pricingType", "discount", "stock", "sku", "availableInCountries", "verifiedStatus", "createdAt", "updatedAt"],
      order: [[orderBy, orderDir]]
    })
    //using http-error lib for error handling
    if (!data) throw new createHttpError.NotFound("data not found");
    return data
  },

  postProducts: async (reqObj) => {
    let dataPosted = await db.products.create(reqObj)
    return dataPosted
  },
};
