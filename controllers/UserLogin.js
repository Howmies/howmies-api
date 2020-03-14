const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const pool = require('../elephantsql');

dotenv.config();

const tokenKeys = {
  keyPrivate: process.env.RSA_PRIVATE_KEY,
  keyPublic: process.env.RSA_PUBLIC_KEY,
};

const salt = bcrypt.genSaltSync(10);

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
        });
      }

      const expiresIn = '1h';
      const passwordCrypt = bcrypt.hashSync(password, salt);
      const uid = result.rows[0].user_id;
      const role = 'user';
      const token = jwt.sign({ role, uid, passwordCrypt }, tokenKeys.keyPrivate, { expiresIn });

      response.status(200).set('Authorization', token).send({
        message: 'Successfully signed up',
        data: {
          uid,
          username: result.rows[0].first_name,
        },
      });
    });
};
