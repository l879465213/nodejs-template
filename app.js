const cors = require("cors");
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const bodyParser = require("body-parser");
const configs = require("./src/configs");
const socketIo = require("socket.io");
const io = socketIo();

app.set("port", configs.port);
app.use(
  cors({
    origin: "*",
    exposedHeaders: ["authorization"],
  })
);
app.use(
  bodyParser.json({
    extended: true,
    limit: "500mb",
  })
);
app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: "500mb",
  })
);
app.use("/", (req, res, next) => {
  console.log(new Date());
  console.log(`${String(req.method).toUpperCase()} - ${req.ip}  :  ${req.url}`);
  console.log("PARAMS : ", req.params);
  console.log("QUERY : ", req.query);
  console.log("BODY : ", req.body);
  console.log("");
  next();
});
app.use("/", require("./src/api/index"));

io.attach(server);
require("./socket").init(io);
server.listen(app.get("port"));
console.log("port: "+ app.get("port"))
