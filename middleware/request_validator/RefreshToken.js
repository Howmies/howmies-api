const { cookie } = require('express-validator');

module.exports = [
  cookie('HURT')
    .trim(' ')
    .notEmpty()
    .withMessage('Invalid accessibility')
    .isJWT()
    .withMessage('Invalid token')
    .escape(),
];
