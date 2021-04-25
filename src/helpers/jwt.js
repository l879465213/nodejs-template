const jwt = require("jsonwebtoken");
const configs = require("../configs/index");
const sign = (obj) => {
  return jwt.sign({...obj}, configs.jwt);
};

const verify = (token) => {
  try {
    if (!token) {
      throw "Access denied";
    }
    return jwt.verify(token, configs.jwt);
  } catch (error) {
    throw error;
  }
};

module.exports = { sign, verify };
