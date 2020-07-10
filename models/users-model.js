const pool = require('../configs/elephantsql');

module.exports = class {
  /**
   * @description Get a user by email address
   * @param {String} email user's normalized email address
   * @returns {Promise} account associated with the email address
   */

  static async getByEmail(email) {
    const queryString = `SELECT * FROM users
    WHERE email=$1;`;
    const queryValues = [email];
    try {
      const { rows } = await pool.query(queryString, queryValues);
      return Promise.resolve(rows[0]);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * @description Check that a user exists either by email address or phone number
   * @param {String} email user's normalized email address
   * @param {String} phone user's international standard phone number
   * @returns {Promise}  number of accounts associated with both the email and the phone number
   */

  static async countByEmailOrPhone(email, phone) {
    const queryString = `SELECT id FROM users
    WHERE (email=$1 AND phone IS NOT NULL)
    OR (phone=$2 AND email IS NOT NULL);`;
    const queryValues = [email, phone];
    try {
      const { rowCount } = await pool.query(queryString, queryValues);
      return Promise.resolve(rowCount);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * @description Check that a user is still authenticated by their version
   * @param {String} email user's normalized email address
   * @param {Number} authVersion current version of user authentication
   * @returns {Promise}  number of accounts associated with both the email and the auth version
   */

  static async countByEmailAndAuthVersion(email, authVersion) {
    const queryString = 'SELECT id FROM users WHERE email=$1 AND _v=$2;';
    const queryValues = [email, authVersion];
    try {
      const { rowCount } = await pool.query(queryString, queryValues);
      return Promise.resolve(rowCount);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * @description creates and activates a new user account on adding to database
   * @param {String} email user's normalized email address
   * @param {String} phone user's international standard phone number
   * @param {String} password user's hashed password
   * @param {String} firstName user's first name
   * @param {String} lastName user's last name
   * @returns {Promise} email, phone number, first name and last name on success
   */

  static async create(
    email, phone, password, firstName, lastName,
  ) {
    const queryString = `INSERT INTO users(email, phone, password, first_name, last_name)
    VALUES($1, $2, $3, $4, $5)
    RETURNING id, email, phone, first_name, last_name;`;

    const queryValues = [email, phone, password, firstName, lastName];

    try {
      const { rows } = await pool.query(queryString, queryValues);
      return Promise.resolve(rows[0]);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * @description updates permissible user details
   * @param {Number} id The user id.
   * @param {Object} newUserData The data the account owner wants to change.
   * @param {String} newUserData.firstName The user's first name.
   * @param {String} newUserData.lastName The user's last name.
   * @param {String} newUserData.password The user's hashed password.
   * @param {String} newUserData.phone The user's phone number.
   * @returns {Promise} email, phone number, first name and last name on success.
   */

  static async update(id, newUserData) {
    const setUpdate = () => {
      let text = '';

      Object.keys(newUserData).forEach((k, i, arr) => {
        if (newUserData[k] != null) {
          text += `${k}='${newUserData[k]}'`;
          if (i !== arr.length - 1) {
            text += ', ';
          }
        }
      });

      return text;
    };

    const queryString = `UPDATE users
    SET ${setUpdate()}
    WHERE "id"=$1
    RETURNING email, phone, first_name, last_name;`;

    const queryValues = [id];

    try {
      const { rows } = await pool.query(queryString, queryValues);
      return Promise.resolve(rows[0]);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * @description closes user account on deleting from database
   * @param {Number} id choose either the user ID or email
   * @returns {String} success message
   */

  static async deleteById(id) {
    const queryString = 'DELETE FROM users WHERE "id"=$1;';
    const queryValues = [id];
    try {
      await pool.query(queryString, queryValues);
      return Promise.resolve('User account deleted successfully');
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * @description closes user account on deleting from database
   * @param {String} email choose either the user ID or email
   * @returns {String} success message
   */

  static async deleteByEmail(email) {
    if (process.env.NODE_ENV === 'test') {
      const queryString = 'DELETE FROM users WHERE email=$1;';
      const queryValues = [email];
      try {
        await pool.query(queryString, queryValues);
        return Promise.resolve('User account deleted successfully');
      } catch (err) {
        return Promise.reject(err);
      }
    } else {
      return Promise.reject(new Error('This is allowed only in a test environment'));
    }
  }
};
