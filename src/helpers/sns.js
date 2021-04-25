const { sns } = require("./aws");

const sendSns = async ({ phone, message }) => {
  await sns
    .publish({
      Message: message,
      PhoneNumber: `+82${phone}`,
    })
    .promise();
};
module.exports = { sendSns };
