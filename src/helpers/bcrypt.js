const bcrypt = require("bcrypt");

const hash = (password) => {
  try {
    const hashed = bcrypt.hashSync(password, 10);
    return hashed;
  } catch (error) {
    throw error;
  }
};

const compare = (hashed, input) => {
  try {
    return bcrypt.compareSync(input, hashed);
  } catch (error) {
    throw error;
  }
};

module.exports = { hash, compare };
