const multerS3 = require("multer-s3");
const crypto = require("crypto");
const path = require("path");
const { AWS } = require("./aws");
const multer = require("multer");
const { s3Bucket } = require("../configs/index");

const makeMulterObject = (folder) =>
  multer({
    storage: multerS3({
      s3: new AWS.S3(),
      bucket: s3Bucket,
      acl: "public-read",
      metadata: (req, file, cb) => {
        cb(null, { fieldName: file.fieldname });
      },
      key: (req, file, cb) => {
        cb(
          null,
          `${folder}/${crypto
            .randomBytes(5)
            .toString("hex")}-${Date.now()}${path.extname(file.originalname)}`
        );
      },
    }),
  });

const profiles = makeMulterObject("profiles");
const policy = makeMulterObject("policy");
const notice = makeMulterObject("grade");

module.exports = {
  notice,
  policy,
  profiles,
};
