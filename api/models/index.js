"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
// console.log("using env in index model>>>", env);
const config = require("../config/config.js")[env];
// console.log("using config in index model >>>", config);

const db = {};
/* console.log("db cred=>>", config.database, config.username, config.password, {
  host: config.host,
  port: config.port,
  dialect: config.dialect,
}); */
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    pool: {
      max: 10,
      min: 0,
      idle: 10000,
    },
    // dialectOptions: config.dialectOptions,
    logging: console.log,
    // dialectOptions: {
    // useUTC: false, //for reading from database
    // dateStrings: true,
    // typeCast: true,
    // timezone: "+05:30"
    // },
    // timezone: '+00:00' //for writing to database
    // logging: (...msg) => console.log(msg),
  }
);

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
