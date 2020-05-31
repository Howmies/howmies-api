const { header } = require('express-validator');

module.exports = [
  header('Authorization')
    .trim(' ')
    .notEmpty()
    .withMessage('Invalid accessibility')
    .isJWT()
    .withMessage('Invalid accessibles')
    .escape(),
];
