const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const pool = require('../elephantsql');

dotenv.config();

if (dotenv.config().error) throw dotenv.config().error;

const tokenKeys = {
  keyPrivate: process.env.RSA_PRIVATE_KEY,
  keyPublic: process.env.RSA_PUBLIC_KEY,
};

const salt = bcrypt.genSaltSync(10);

const expiresIn = '20 minutes';

exports.requestValidator = [
  body('firstName').trim(' ')
    .notEmpty()
    .withMessage('Input your first name')
    .escape(),
  body('lastName').trim(' ')
    .notEmpty()
    .withMessage('Input your last name')
    .escape(),
  body('email').trim(' ')
    .notEmpty()
    .withMessage('Input a user email')
    .isEmail()
    .withMessage('Input correct email address')
    .normalizeEmail({ all_lowercase: true }),
  body('phoneNumber').trim(' ')
    .notEmpty()
    .withMessage('Input a phone number into the phone number field')
    .isLength({ max: 14, min: 11 })
    .withMessage('Ensure you are inputting a standard phone number e.g. 08123456789 or +2348123456789')
    .escape(),
  body('otherPhone').trim(' ')
    .notEmpty()
    .withMessage('Do not send empty data in the optional phone number field')
    .isLength({ max: 14, min: 11 })
    .withMessage('Ensure you are inputting a standard phone number e.g. 08123456789 or +2348123456789')
    .escape()
    .optional({ nullable: true }),
  body('password').trim(' ')
    .notEmpty()
    .withMessage('Input a user password')
    .isLength({ max: 24, min: 8 })
    .withMessage('Password must be between 8 - 24 characters')
    .escape(),
];

exports.signup = (req, response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { return response.status(422).send({ error: errors.array() }); }

  const {
    firstName,
    lastName,
    email,
    phoneNumber,
    otherPhone,
    password,
  } = req.body;

  pool.query('SELECT email FROM real_estate_agents WHERE email=$1', [email], (err, result) => {
    if (err) {
      return response.status(500).send({
        status: response.statusCode,
        data: {
          warningMessage: 'Internal Server error',
        },
      });
    }

    if (result.rows.length !== 0) {
      response.status(400)
        .send({
          status: response.statusCode,
          data: { warningMessage: 'Account exists as Real Estate Agent' },
        });
    } else if (phoneNumber.length !== 11 && phoneNumber.length !== 14) {
      response.status(400)
        .send({
          status: response.statusCode,
          data: { warningMessage: 'Input a valid phone number into the main phone number field' },
        });
    } else if (otherPhone && otherPhone.length !== 11 && otherPhone.length !== 14) {
      response.status(400)
        .send({
          status: response.statusCode,
          data: { warningMessage: 'Input a valid phone number into the other phone number field' },
        });
    } else if (phoneNumber === otherPhone) {
      response.status(400)
        .send({
          status: response.statusCode,
          data: { warningMessage: 'Use a different phone number for the other phone number field' },
        });
    } else {
      const passwordCrypt = bcrypt.hashSync(password, salt);
      const token = jwt.sign({ email, passwordCrypt }, tokenKeys.keyPrivate, { expiresIn });

      pool.query('INSERT INTO property_owners(owner_fname, owner_lname, owner_email, owner_phone_number, owner_other_phone, owner_password) VALUES($1, $2, $3, $4, $5, $6) RETURNING *',
        [firstName,
          lastName,
          email,
          phoneNumber,
          (otherPhone && otherPhone.length) ? otherPhone : null,
          passwordCrypt],
        (err1, result1) => {
          if (err1) {
            return response.status(406).send({
              status: err1.name,
              data: {
                warningMessage: (err1.stack.includes('duplicate', 0)) ? 'Account already in use' : 'Internal Server Error',
              },
            });
          }

          response.set('Authorization', token).send({
            token,
            ownerID: result1.rows[0].owner_id,
          });
        });
    }
  });
};
