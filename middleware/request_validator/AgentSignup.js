const { body } = require('express-validator');

exports.agentSignupValidator = [
  body('agentName')
    .trim(' ')
    .notEmpty()
    .withMessage('Input agency name')
    .escape(),
  body('address')
    .trim(' ')
    .notEmpty()
    .withMessage('Input office address')
    .escape(),
  body('lga')
    .trim(' ')
    .notEmpty()
    .withMessage('Input office local government area')
    .escape(),
  body('state')
    .trim(' ')
    .notEmpty()
    .withMessage('Input the state your office is located')
    .escape(),
  body('email')
    .trim(' ')
    .notEmpty()
    .withMessage('Input a user email')
    .isEmail()
    .withMessage('Input correct email address')
    .normalizeEmail({ all_lowercase: true }),
  body('officeNumber')
    .trim(' ')
    .notEmpty()
    .withMessage('Input a phone number into the office number field')
    .custom((value) => value.length === 11 || value.length === 14)
    .withMessage(
      'Ensure you are inputting a standard phone number e.g. 08123456789 or +2348123456789',
    )
    .escape(),
  body('mobileNumber')
    .optional({ nullable: true })
    .custom((value, { req }) => value !== req.body.officeNumber)
    .withMessage(
      'mobile number must not be the same as office number',
    )
    .trim(' ')
    .custom((value) => value.length === 11 || value.length === 14)
    .withMessage(
      'Ensure you are inputting a standard phone number e.g. 08123456789 or +2348123456789',
    )
    .escape(),
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
