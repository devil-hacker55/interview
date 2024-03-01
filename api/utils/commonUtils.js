"use-strict";
const admin = require("../helpers/firebase");
const moment = require("moment");
const PromiseHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

function convertH2M(timeInHour) {
  var timeParts = timeInHour.split(":");
  return Number(timeParts[0]) * 60 + Number(timeParts[1]);
}

function generateRandom(n) {
  var add = 1,
    max = 12 - add; // 12 is the min safe number Math.random() can generate without it starting to pad the end with zeros.

  if (n > max) {
    return generate(max) + generate(n - max);
  }
  

  max = Math.pow(10, n + add);
  var min = max / 10; // Math.pow(10, n) basically
  var number = Math.floor(Math.random() * (max - min + 1)) + min;

  return ("" + number).substring(add);
}

function printMagicMethods(instance) {
  console.log(Object.keys(instance.__proto__));
  return 1;
}

function basicDetails(user) {
  const {
    id,
    userType,
    firstName,
    lastName,
    countryId,
    email,
    profileImage,
    mobile,
    isActive,
    isSubscribed,
    planExpiresOn,
    isTrial,
  } = user;
  return {
    id,
    userType,
    firstName,
    lastName,
    countryId,
    email,
    profileImage,
    mobile,
    isActive,
    isSubscribed,
    planExpiresOn,
    isTrial,
  };
}

function profileDetails(user) {
  const {
    fullName,
    id,
    firstName,
    lastName,
    countryId,
    email,
    profileImage,
    mobile,
    isActive,
    userType,
    addSignature,
    isVerified,
    isGoogleLogin,
    industryType
  } = user;

  return {
    fullName,
    id,
    firstName,
    lastName,
    countryId,
    email,
    profileImage,
    addSignature,
    mobile,
    isActive,
    userType,
    industryType
  };
}

function additionalDetails(user) {
  const {
    compositeType,
    legalName,
    isRegistered,
    isRemoteShop,
    businessType,
    accountMethod,
    gstType,
    gstinNo,
    panNumber,
    tradeName,
    financialYearFrom,
    bookBeginningFrom,
    cinNumber,
  } = user;
  return {
    compositeType,
    legalName,
    isRegistered,
    isRemoteShop,
    businessType,
    gstType,
    gstinNo,
    accountMethod,
    panNumber,
    tradeName,
    financialYearFrom,
    bookBeginningFrom,
    cinNumber,
  };
}

function getPagination(page, size) {
  const limit = size ? +size : 5;
  const offset = page ? (page - 1) * limit : 0;

  return { limit, offset };
}

function getPagingData(data, page, limit) {
  const { count: totalrows, rows: pageData } = data;
  const currentPage = page ? +page : 1;
  const totalPages = Math.ceil(totalrows / limit);

  return { totalrows, pageData, totalPages, currentPage };
}

const countDefined = (arr = []) => {
  let filtered;
  filtered = arr.filter((el) => {
    let a = el !== "undefined" && el !== undefined && el !== null && el !== "";
    return a;
  });
  const { length } = filtered;
  return length;
};

const upperCaseArray = (arr = []) => {
  return arr.map((name) => name.toUpperCase());
};

const lowerCaseArray = (arr = []) => {
  return arr.map((name) => name.toLowerCase());
};

const ArrayIncludeArray = (superArr = [], subsetArr = []) => {
  return subsetArr.every((ai) => superArr.includes(ai));
};

async function sendNotification(message) {
  // Create a list containing up to 500 registration tokens.
  // These registration tokens come from the client FCM SDKs.
  // const registrationTokens = [
  //     'YOUR_REGISTRATION_TOKEN_1',
  //     // …
  //     'YOUR_REGISTRATION_TOKEN_N',
  // ];
  let response = await admin.messaging().sendMulticast(message);
  console.log(response.successCount + " messages were sent successfully");
  return response;
}
const generateSuccessJSON = (data, message, statusCode, success) => {
  // return data
  let a = {
    schema: {
      type: "object",
      properties: {
        success: {
          type: "boolean",
          example: success ? success : true,
        },
        status: {
          type: "integer",
          example: statusCode ? statusCode : 200,
        },
        ...(message && {
          message: {
            type: "string",
            example: message,
          },
        }),
        data: {
          type: "object",
          properties: data,
        },
      },
    },
  };
  // return {
  //     "success": success ? success : true,
  //     "status": status ? status : 200,
  //     "message": message ? message : null,
  //     "data": data ? data : null
  // }
  return a;
};

const generateErrorJSON = (error_message, statusCode, expose) => {
  // return data
  let a = {
    schema: {
      type: "object",
      properties: {
        success: {
          type: "boolean",
          example: false,
        },
        status: {
          type: "integer",
          example: statusCode ? statusCode : 500,
        },
        expose: {
          type: "boolean",
          example: expose ? expose : false,
        },
        error_message: {
          type: "string",
          example: error_message ? error_message : "something went wrong",
        },
      },
    },
  };
  return a;
};

function timeSince(date) {
  var seconds = Math.floor((new Date() - date) / 1000);

  var interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + "y";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + "m";
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + "d";
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + "h";
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + "m";
  }
  return Math.floor(seconds) + "s";
}
function idGenerate() {
  var now = new Date();

  timestamp = now.getFullYear().toString(); // 2011
  timestamp += (now.getMonth < 9 ? "0" : "") + (now.getMonth() + 1).toString(); // JS months are 0-based, so +1 and pad with 0's
  timestamp += (now.getDate < 10 ? "0" : "") + now.getDate().toString(); // pad with a 0
  timestamp +=
    now.getHours().toString() +
    now.getMinutes().toString() +
    now.getSeconds().toString() +
    now.getMilliseconds().toString();
  return timestamp;
}

function addWithLeadingZeros(a, b) {
  const sum = parseInt(a) + b;
  const leadingZeros = Math.max(String(a).length, String(b).length) - String(sum).length;
  return '0'.repeat(Math.max(0, leadingZeros)) + sum;
}
const ConvertMMDDYYYY = (date) => {
  return moment.tz(date, "Asia/Kolkata").toDate()
  // return moment(date).utcOffset("-06:00").format("MM/DD/YYYY") .format("YYYY-MM-DD HH:mm:ss")
}

module.exports = {
  addWithLeadingZeros,
  convertH2M,
  basicDetails,
  profileDetails,
  additionalDetails,
  getPagination,
  getPagingData,
  sendNotification,
  countDefined,
  PromiseHandler,
  lowerCaseArray,
  upperCaseArray,
  ArrayIncludeArray,
  printMagicMethods,
  generateRandom,
  generateSuccessJSON,
  generateErrorJSON,
  timeSince,
  idGenerate,
  ConvertMMDDYYYY
};
