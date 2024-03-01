// Load dependencies
const aws = require("aws-sdk");
const createHttpError = require("http-errors");
const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path");

const AWS_Bucket_Name = "sujay-images";

const s3 = new aws.S3({
  accessKeyId: "sujay",
  secretAccessKey: "sujay",
  signatureVersion: 'v4',
  region: 'ap-south-1'
});

async function getUrl(myKey) {
  return s3.getSignedUrlPromise("getObject", {
    Bucket: AWS_Bucket_Name,
    Key: myKey,
    Expires: 60 * 5,
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
    fileSize: 1024 * 1024 * 6, // we are allowing only 5 MB files
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
}).single("upload", 1);

module.exports = {
  imageUpload,
  getUrl,
  deleteFile
};
