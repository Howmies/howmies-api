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

module.exports.url = [
  param('resetToken')
    .notEmpty()
    .withMessage('Invalid URL')
    .escape(),
];

module.exports.password = [
  body('password')
    .trim(' ')
    .notEmpty()
    .withMessage('Input a user password')
    .isLength({ max: 24, min: 8 })
    .withMessage('Password must be at least than 8 characters long')
    .custom((value, { req }) => value === req.body.confirmPassword)
    .withMessage('Passwords do not match')
    .escape(),
];
