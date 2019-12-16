const { Pool } = require('pg');

const conObj = {
  user: 'bzhecudy',
  host: 'rajje.db.elephantsql.com',
  database: 'bzhecudy',
  password: 'WLlMHBJXGbcl-KBAiC2nPJeVSjQhbKkG',
  port: 5432,
};

const pool = new Pool(conObj);

module.exports = pool;
