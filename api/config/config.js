require('dotenv').config();
module.exports = {
  "activeEnv": process.env.NODE_ENV,
  "development": {
    "username": process.env.DEV_DB_USERNAME,
    "password": process.env.DEV_DB_PASSWORD,
    "database": process.env.DEV_DB_DATABASE,
    "host": process.env.DEV_DB_HOST,
    "port": process.env.DEV_DB_PORT,
    "dialect": process.env.DEV_DB_DIALECT,
    "JWT_SECRET": process.env.JWT_SECRET,
    "JWT_SECRET_EXPIRY_SEC": process.env.JWT_SECRET_EXPIRY_SEC,
    "JWT_TOKEN_ALGORITHM_TYPE": process.env.JWT_TOKEN_ALGORITHM_TYPE,
    "emailFrom": "dahakesujay45@gmail.com",
    "smtpOptions": {
      host: 'smtp-relay.brevo.comm',
      port: 587,
      auth: {
        user: "dahakesujay45@gmail.com",
        pass: process.env.SMTP_PASS
      },
    }
  },
  "test": {
    "username": process.env.TEST_DB_USERNAME,
    "password": process.env.TEST_DB_PASSWORD,
    "database": process.env.TEST_DB_DATABASE,
    "host": process.env.TEST_DB_HOST,
    "port": process.env.TEST_DB_PORT,
    "dialect": process.env.TEST_DB_DIALECT,
    "JWT_SECRET": process.env.JWT_SECRET,
    "JWT_SECRET_EXPIRY_SEC": process.env.JWT_SECRET_EXPIRY_SEC,
    "JWT_TOKEN_ALGORITHM_TYPE": process.env.JWT_TOKEN_ALGORITHM_TYPE,
    "emailFrom": "dahakesujay45@gmail.comm",
    "smtpOptions": {
      host: 'smtp-relay.brevo.com',
      port: 587,
      //secure:s true,
      auth: {
        user: "dahakesujay45@gmail.com",
        pass: process.env.SMTP_PASS
      },
    }

  },
  "production": {
    "username": process.env.PROD_DB_USERNAME,
    "password": process.env.PROD_DB_PASSWORD,
    "database": process.env.PROD_DB_DATABASE,
    "host": process.env.PROD_DB_HOST,
    "port": process.env.PROD_DB_PORT,
    "dialect": process.env.PROD_DB_DIALECT,
    "JWT_SECRET": process.env.JWT_SECRET,
    "JWT_SECRET_EXPIRY_SEC": process.env.JWT_SECRET_EXPIRY_SEC,
    "JWT_TOKEN_ALGORITHM_TYPE": process.env.JWT_TOKEN_ALGORITHM_TYPE,
    "emailFrom": "dahakesujay45@gmail.comm",
    "smtpOptions": {
      host: 'smtp-relay.brevo.com',
      port: 587,
      //secure:s true,
      auth: {
        user: "dahakesujay45@gmail.com",
        pass: process.env.SMTP_PASS
      },
    }
  }

}

