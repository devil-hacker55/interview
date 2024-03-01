'use-strict'
require('dotenv').config();
// console.log("env value>>",process.env.NODE_ENV)
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const mysql = require('mysql2/promise');
// console.log(config)
module.exports = (async function initialize() {

    // console.log("Using Configuration =>", env)
    // create db if it doesn't already exist
    const connection = await mysql.createConnection({
        host: config.host,
        port: config.port,
        user: config.username,
        password: config.password
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\`;`);

    let db = require("../models/index")

    await db.sequelize.authenticate();
    // console.log(" => Database Authenticated Successfully !!")
    // sync all models with database
    await db.sequelize.sync({ force: false });
    // await db.users.sync({ alter: true });
    // console.log(" => Database Synced Successfully !!")
    db.hy = "hyy"
    return db
})()