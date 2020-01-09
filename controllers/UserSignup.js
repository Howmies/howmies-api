const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const pool = require('../middleware/database/elephantsqlConfig');

dotenv.config();

if (dotenv.config().error) throw dotenv.config().error;

exports.signup = (req, response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { return response.status(422).send({ message: errors.array() }); }

  const {
    firstName, lastName, email, phone, password,
  } = req.body;

  const passwordCrypt = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
  const userRegDate = (new Date()).toUTCString();

  pool.query('INSERT INTO users(first_name, last_name, email, phone, password, register_date) VALUES($1, $2, $3, $4, $5, $6) RETURNING *',
    [firstName,
      lastName,
      email,
      phone,
      passwordCrypt,
      userRegDate,
    ],
    (err, result) => {
      if (err) {
        return response.status(406).send({
          status: err.name,
          message: (err.message.includes('duplicate', 0)) ? 'Account already in use' : 'Internal Server Error',
        });
      }

      jwt.sign({
        uid: result.rows[0].user_id,
        role: 'user',
        iat: (new Date()).valueOf(),
      }, process.env.RSA_PRIVATE_KEY, { expiresIn: 900, algorithm: 'HS256' }, (errToken, token) => {
        if (errToken) {
          return response.status(500).send({
            status: errToken.name,
            message: errToken.message,
          });
        }

        response.status(200).set('Authorization', token).send({
          message: 'Successfully signed up',
        });
      });
    });
};
