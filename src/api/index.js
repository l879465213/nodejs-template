const app = (module.exports = require("express")());

app.use("/users", require("./users"));
