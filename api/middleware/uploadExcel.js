
const createHttpError = require('http-errors');
const multer = require('multer');
const XLSX = require('xlsx');
const db = require('../models');
const { Op } = require('sequelize');
const moment = require("moment");
const commonUtils = require("../utils/commonUtils");
const usersService = require('../services/users.service');
const { sendEmail } = require('../helpers/sendEmail');
const upload = multer({
    storage: multer.memoryStorage(), fileFilter: function (req, file, cb) {
        if (
            file.mimetype.includes("excel") ||
            file.mimetype.includes("spreadsheetml")
        ) {
            cb(null, true);
        } else {
            cb("Please upload only excel file.", false);
        };
    }
}).single('file');

module.exports = {
    getExcelFile: async function (req, res, next) {
        upload(req, res, function (err) {
            if (err) {
                next(err)
            }
            console.log("req.file => ", req.file)
            next()
        });
    },
    excelToJSON: async function (file, options, sheet, range) {

        var workbook = XLSX.read(file);
        var sheet_name_list = workbook.SheetNames;
        let ws = workbook.Sheets[sheet_name_list[sheet]];
        if (range) {
            ws['!ref'] = range// change the sheet range to A2:C3
        }
        let data = XLSX.utils.sheet_to_json(ws, options)
        // data.shift();
        return data
    },

}