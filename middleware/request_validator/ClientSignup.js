const { body } = require('express-validator');

exports.clientSignupValidator = [
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
    .isMobilePhone(['en-NG'], { strictMode: true })
    .withMessage('Input a standard phone number e.g +234 8012345678')
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
