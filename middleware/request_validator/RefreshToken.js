const { header } = require('express-validator');

module.exports = [
  header('X-Refresh-Token')
    .trim(' ')
    .notEmpty()
    .withMessage('Invalid accessibility')
    .isJWT()
    .withMessage('Invalid token')
    .escape(),
];
