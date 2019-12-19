const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config();

if (dotenv.config().error) throw dotenv.config().error;

const conObj = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
};

const pool = new Pool(conObj);

module.exports = pool;
