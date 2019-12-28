const { body } = require('express-validator');

exports.ownerSignupValidator = [
  body('firstName')
    .trim(' ')
    .notEmpty()
    .withMessage('Input your first name')
    .escape(),
  body('lastName')
    .trim(' ')
    .notEmpty()
    .withMessage('Input your last name')
    .escape(),
  body('email')
    .trim(' ')
    .notEmpty()
    .withMessage('Input a user email')
    .isEmail()
    .withMessage('Input correct email address')
    .normalizeEmail({ all_lowercase: true }),
  body('phoneNumber')
    .trim(' ')
    .notEmpty()
    .withMessage('Input a phone number into the phone number field')
    .custom((value) => value.length === 11 || value.length === 14)
    .withMessage(
      'Ensure you are inputting a standard phone number e.g. 08123456789 or +2348123456789',
    )
    .escape(),
  body('otherPhone')
    .optional({ nullable: true })
    .custom((value, { req }) => value !== req.body.phoneNumber)
    .withMessage(
      'other phone number must not be the same as primary phone number',
    )
    .trim(' ')
    .custom((value) => value.length === 11 || value.length === 14)
    .withMessage(
      'Ensure you are inputting a standard phone number e.g. 08123456789 or +2348123456789',
    ),
  body('password')
    .trim(' ')
    .notEmpty()
    .withMessage('Input a user password')
    .isLength({ max: 24, min: 8 })
    .withMessage('Password must be between 8 - 24 characters')
    .escape(),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage(
      'confirmation password must be the same as the password you entered',
    )
    .trim(' ')
    .notEmpty()
    .withMessage('Confirm your user password')
    .isLength({ max: 24, min: 8 })
    .withMessage('Password must be between 8 - 24 characters')
    .escape(),
];
