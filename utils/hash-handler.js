const bcrypt = require('bcryptjs');

module.exports = class {
  static generateHash(value) {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(value, salt);
  }

  static verifyHash() { }
};
