const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const pool = require('../elephantsql');

dotenv.config();

if (dotenv.config().error) console.log(dotenv.config().error);

const tokenKeys = {
  keyPrivate: process.env.RSA_PRIVATE_KEY,
  keyPublic: process.env.RSA_PUBLIC_KEY,
};

const salt = bcrypt.genSaltSync(10);

const expiresIn = '20 minutes';

exports.login = (req, response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { return response.status(422).send({ message: errors.array() }); }

  const { email, password } = req.body;

  const passwordCrypt = bcrypt.hashSync(password, salt);
  const token = jwt.sign({ email, passwordCrypt }, tokenKeys.keyPrivate, { expiresIn });

  pool.query('SELECT * FROM users WHERE email=$1',
    [email],
    (err, result) => {
      if (err) {
        return response.status(500).send({
          status: err.name,
          message: 'Internal Server Error',
          data: {},
        });
      }

      if (!result.rows
        || (result.rows.length < 1)
        || !bcrypt.compareSync(password, result.rows.find((e) => e.email === email).password)) {
        return response.status(406).send({
          status: 'Error',
          message: 'Incorrect email or password',
          data: {},
        });
      }

      response.status(200).set('Authorization', token).send({
        message: 'Successfully signed up',
        data: {
          userID: result.rows[0].user_id,
          username: result.rows[0].first_name,
        },
      });
    });
};
