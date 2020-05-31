const { param, query } = require('express-validator');

exports.propertyHuntValidator = [
  param('pagination')
    .trim(' ')
    .notEmpty()
    .withMessage('Input pagination index')
    .toInt(10)
    .isInt({ min: 0 })
    .withMessage('Pagination index must be a positive integer')
    .customSanitizer((value) => value * 10),
  query('location')
    .optional()
    .trim(' ')
    .notEmpty()
    .withMessage('Location field was sent empty')
    .escape(),
  query('type')
    .optional()
    .trim(' ')
    .notEmpty()
    .withMessage('Type field was sent empty')
    .customSanitizer((value) => value.toLowerCase())
    .escape(),
  query('features.*')
    .optional()
    .trim(' ')
    .notEmpty()
    .withMessage('Features field was sent empty')
    .customSanitizer((value) => value.toLowerCase())
    .escape(),
];
