const pool = require('../configs/elephantsql');

module.exports = class {
  /**
   * @description Select a user either by email or phone number
   * @param {String} email user's normalized email address
   * @param {String} phone user's international standard phone number
   * @returns {Promise} email and phone number on success
   */

  static async getByEmailOrPhone(email, phone) {
    const queryString = 'SELECT email, phone FROM users WHERE email=$1 OR phone=$2;';
    const queryValues = [email, phone];
    try {
      const user = await pool.query(queryString, queryValues);
      return Promise.resolve(user.rowCount);
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
    RETURNING email, phone, first_name, last_name;`;

    const queryValues = [email, phone, password, firstName, lastName];

    try {
      const user = await pool.query(queryString, queryValues);
      return Promise.resolve(user.rows);
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
      let text;

      Object.keys(newUserData).forEach((k, i) => {
        if (newUserData[k] != null) {
          text = '';
          if (i === Object.keys(newUserData).length - 1) {
            text += `${k}='${newUserData[k]}'`;
          } else {
            text += `${k}='${newUserData[k]}', `;
          }
        }
      });

      return text;
    };

    const queryString = `UPDATE users
    SET ${setUpdate()}
    WHERE id=$1
    RETURNING email, phone, first_name, last_name;`;

    const queryValues = [id];

    try {
      const user = await pool.query(queryString, queryValues);
      return Promise.resolve(user);
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
    const queryString = 'DELETE FROM users WHERE id=$1;';
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
