const { body, param } = require('express-validator');

module.exports.email = [
  body('email')
    .trim(' ')
    .notEmpty()
    .withMessage('Input a user email')
    .isEmail()
    .withMessage('Input correct email address')
    .normalizeEmail({ all_lowercase: true }),
];

module.exports.password = [
  body('password')
    .trim(' ')
    .notEmpty()
    .withMessage('Input a user password')
    .isLength({ max: 24, min: 8 })
    .withMessage('Password must not be less than 8 characters long')
    .escape(),
];

module.exports.url = [
  param('resetToken')
    .notEmpty()
    .withMessage('invalid url')
    .escape(),
];
