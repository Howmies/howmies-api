const { body } = require('express-validator');

exports.agentRequestValidator = [
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
    .isLength({ max: 14, min: 11 })
    .withMessage(
      'Ensure you are inputting a standard phone number e.g. 08123456789 or +2348123456789',
    )
    .escape(),
  body('mobileNumber')
    .trim(' ')
    .notEmpty()
    .withMessage('Do not send empty data in the optional mobile number field')
    .isLength({ max: 14, min: 11 })
    .withMessage(
      'Ensure you are inputting a standard phone number e.g. 08123456789 or +2348123456789',
    )
    .escape()
    .optional({ nullable: true }),
  body('password')
    .trim(' ')
    .notEmpty()
    .withMessage('Input a user password')
    .isLength({ max: 24, min: 8 })
    .withMessage('Password must be between 8 - 24 characters')
    .escape(),
];

exports.ownerRequestValidator = [
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
    .isLength({ max: 14, min: 11 })
    .withMessage(
      'Ensure you are inputting a standard phone number e.g. 08123456789 or +2348123456789',
    )
    .escape(),
  body('otherPhone')
    .trim(' ')
    .notEmpty()
    .withMessage('Do not send empty data in the optional phone number field')
    .isLength({ max: 14, min: 11 })
    .withMessage(
      'Ensure you are inputting a standard phone number e.g. 08123456789 or +2348123456789',
    )
    .escape()
    .optional({ nullable: true }),
  body('password')
    .trim(' ')
    .notEmpty()
    .withMessage('Input a user password')
    .isLength({ max: 24, min: 8 })
    .withMessage('Password must be between 8 - 24 characters')
    .escape(),
];
