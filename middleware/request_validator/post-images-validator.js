const { param } = require('express-validator');

module.exports = [
  param('property_id')
    .trim(' ')
    .notEmpty()
    .withMessage('The property ID must be stated in the URL')
    .isInt()
    .withMessage('The property ID must be a positive non-zero integer')
    .escape(),
];
