// Load dependencies
const aws = require("aws-sdk");
const createHttpError = require("http-errors");
const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path");

const AWS_Bucket_Name = "propertyimagesnew";

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  signatureVersion: 'v4',
  region: 'ap-south-1'
});

async function getUrl(myKey) {
  return s3.getSignedUrlPromise("getObject", {
    Bucket: AWS_Bucket_Name,
    Key: myKey,
    Expires: 60 * 60 * 6//60 * 5,
  });
}

//delete file with Key

function deleteFile(key) {
  s3.deleteObject({ Bucket: AWS_Bucket_Name, Key: key }, (err, data) => {
    if (err) {
      console.log(err);
    }
    console.log("data::", data);
    return data;
  });
}

// Change bucket property to your Space name
const imageUpload = multer({
  storage: multerS3({
    s3: s3,
    bucket: AWS_Bucket_Name,
    //acl: 'public-read',

    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      console.log("filedetails", file);
      cb(
        null,
        "uploadImage/" + new Date().toISOString() + "-" + file.originalname
      );
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,
  }),
  limits: {
    fileSize: 1024 * 1024 * 4, 
  },
  fileFilter: function (req, file, cb) {
    console.log("file filter>>>>>>>>>>", file);
    const extension = path.extname(file.originalname).toLowerCase();
    const mimetyp = file.mimetype;
    console.log(extension, mimetyp);
    if (
      extension === ".jpg" ||
      extension === ".jpeg" ||
      extension === ".png" ||
      extension === ".pdf" ||
      mimetyp === "image/png" ||
      mimetyp === "image/jpg" ||
      mimetyp === "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(new createHttpError.BadRequest("Invalid file type"), false);
    }
  },
}).single("file", 1);

module.exports = {
  imageUpload,
  getUrl,
  deleteFile
};
