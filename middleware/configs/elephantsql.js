const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config();

const conObj = {};

switch (process.env.NODE_ENV) {
  case 'development':
    conObj.user = process.env.DEV_DB_USER;
    conObj.host = process.env.DEV_DB_HOST;
    conObj.database = process.env.DEV_DB_DATABASE;
    conObj.password = process.env.DEV_DB_PASSWORD;
    conObj.port = process.env.DEV_DB_PORT;
    break;
  case 'testing':
    conObj.user = process.env.TEST_DB_USER;
    conObj.host = process.env.TEST_DB_HOST;
    conObj.database = process.env.TEST_DB_DATABASE;
    conObj.password = process.env.TEST_DB_PASSWORD;
    conObj.port = process.env.TEST_DB_PORT;
    break;
  default:
    conObj.user = process.env.DB_USER;
    conObj.host = process.env.DB_HOST;
    conObj.database = process.env.DB_DATABASE;
    conObj.password = process.env.DB_PASSWORD;
    conObj.port = process.env.DB_PORT;
    break;
}

const pool = new Pool(conObj);

module.exports = pool;
