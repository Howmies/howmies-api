const pg = require('pg');

const conString = 'postgres://bzhecudy:WLIMHBJXGbcl-KBAiC2nPJeVSjQhbKkG@rajje.db.elephantsql.com:5432/bzhecudy';
const conObj = {
  user: 'bzhecudy',
  host: 'rajje.db.elephantsql.com',
  database: 'bzhecudy',
  password: 'WLlMHBJXGbcl-KBAiC2nPJeVSjQhbKkG',
  port: 5432,
};

/** connection to database, using either client or pool, but pool for this project */
const pool = new pg.Pool(conObj);

/* pool.query('SELECT NOW() AS "theTime"', (err, result) => {
  if (err) {
    return console.error('error running query', err);
  }
  console.log(result.rows[0].theTime);
  pool.end();
}); */

module.exports = pool;
