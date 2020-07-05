const pool = require('../configs/elephantsql');

module.exports = class {
  /**
   * @description Get a user by email address
   * @param {String} email user's normalized email address
   * @returns {Promise} account associated with the email address
   */

  static async getByEmail(email) {
    const queryString = 'SELECT * FROM auths WHERE email=$1;';
    const queryValues = [email];
    try {
      const { rows } = await pool.query(queryString, queryValues);
      return Promise.resolve(rows[0]);
    } catch (err) {
      return Promise.reject(err);
    }
  }
};
