const AWS = require("aws-sdk");
AWS.config.loadFromPath("src/configs/aws.json");

const AWSDoyko = require("aws-sdk");
AWSDoyko.config.loadFromPath("src/configs/aws-doyko.json");

const sns = new AWSDoyko.SNS({ apiVersion: "2010-03-31" });
/*
const upload = ({ data, name, dir }) => {
  return new Promise((resolve, reject) => {
    s3.upload(
      {
        Bucket: "",
        ACL: "public-read",
        Key: dir + "/" + dir + "-" + Date.now() + "." + name.split(".").pop(),
        Body: data,
      },
      (e, d) => {
        if (e) {
          reject(e);
        } else {
          resolve(d.key || d.Key);
        }
      }
    );
  });
};

const s3 = new AWS.S3();*/
module.exports = { AWS, AWSDoyko, sns };
