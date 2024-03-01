require("rootpath")();
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const csrf = require("csurf");
const { handleError } = require("./middleware/error.handler");

var offset = new Date().getTimezoneOffset();
console.log(offset);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const morgan = require("morgan");
app.use(morgan("combined"));

app.use(cookieParser());

app.response.sendResponse = function (data, message, statusCode) {
  statusCode = statusCode ? statusCode : 200;
  return this.status(statusCode).send({
    success: true,
    status: statusCode,
    message: message,
    data: data,
  });
};

const responseEnv = ["development", "test", "production"];

app.response.sendError = function (err) {
  const { statusCode, message, stack, expose } = err;
  return this.status(parseInt(statusCode)).send({
    success: false,
    status: statusCode,
    expose: expose,
    error_message: message,
    ...(responseEnv.includes(process.env.NODE_ENV) && { error_stack: stack }),
  });
};

// allow cors requests from any origin and with credentials
app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
  })
);

const logs = (req, res, next) => {
  console.log("Requested URL    >>>>>>> ", `${req.get("host")}${req.path}`);
  console.log("Requested Body   >>>>>>>", req.body);
  console.log("Requested params >>>>>>>", req.params);
  console.log("Requested query  >>>>>>>", req.query);
  return next();
};
app.use(logs);
app.use("/", require("./routes/index.routes"));
app.use((req, res, next) => {
  res.status(404).json({
    msg: `Requested URL ${req.get("host")}${req.path} not found!`,
  });
});

// global error handler
app.use((err, req, res, next) => {
  handleError(err, res);
});
// start server1

async function start() {
  try {
    console.log("starting the server ...");
    await require("./helpers/dbhelper");
    const port = process.env.PORT || 8080;
    // const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 8080) : 4000;
    app.listen(port, () => console.log(" Server listening on port " + port));
  } catch (error) {
    console.log(error);
  }
}
start();
module.exports = app;
