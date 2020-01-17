const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const pool = require('../middleware/database/elephantsqlConfig');

dotenv.config();

if (dotenv.config().error) throw dotenv.config().error;

exports.login = (req, response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { return response.status(422).send({ message: errors.array() }); }

  const { email, password } = req.body;

  pool.query('SELECT * FROM users WHERE email=$1',
    [email],
    (err, result) => {
      if (err) {
        return response.status(500).send({
          status: err.name,
          message: 'Internal server error',
        });
      }

      if (!result.rows
        || (result.rows.length < 1)
        || !bcrypt.compareSync(password, result.rows.find((e) => e.email === email).password)) {
        return response.status(406).send({
          status: 'error',
          message: 'Incorrect email or password',
        });
      }

      jwt.sign({
        uid: result.rows[0].user_id,
        role: 'user',
        iat: (new Date()).valueOf(),
      },
      process.env.RSA_PRIVATE_KEY,
      { expiresIn: 900, algorithm: 'HS256' },
      (errToken, token) => {
        if (errToken) {
          return response.status(500).send({
            status: errToken.name,
            message: errToken.message,
          });
        }

        response.status(200).set('Authorization', token).send({
          message: 'Successfully logged in',
        });
      });
    });
};
