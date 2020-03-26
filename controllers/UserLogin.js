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

module.exports = async (req, response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { return response.status(422).send({ message: errors.array() }); }

  const { email, password } = req.body;

  const user = await pool.query('SELECT * FROM users WHERE email=$1',
    [email])
    .then((result) => {
      if (result.rows
        && result.rows.length > 0
        && bcrypt.compareSync(password, result.rows.find((e) => e.email === email).password)) {
        return {
          data: {
            uid: result.rows[0].user_id,
            name: `${result.rows[0].first_name} ${result.rows[0].last_name}`,
            telephone: result.rows[0].phone,
            emailAddress: result.rows[0].email,
          },
        };
      }
    })
    .catch(() => ({ error: 'Internal Server Error. Try again' }));

  if (user.error) {
    return response.status(500).send({
      remark: 'Error',
      message: user.error,
    });
  }

  if (!user) {
    return response.status(406).send({
      remark: 'Error',
      message: 'Incorrect email or password',
    });
  }

  const {
    uid, name, telephone, emailAddress,
  } = user.data;

  // sign token
  const expiresIn = 1500;
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30;
  const aud = 'user';
  const iss = 'Howmies Entreprise';
  const data = 'refresh user';
  const algorithm = 'HS256';

  const accessToken = jwt.sign(
    {
      iss, aud, uid,
    },
    tokenKeys.keyPrivate,
    { expiresIn, algorithm },
  );
  const refreshToken = jwt.sign(
    { exp, data },
    tokenKeys.keyPrivate,
    { algorithm, issuer: iss, audience: aud },
  );

  // log in user
  const loggedUser = await pool.query(
    'INSERT INTO logged_users(user_id, refresh_token) VALUES($1, $2)',
    [uid, refreshToken],
  )
    .then(() => null)
    .catch((err) => {
      if (!err) {
        return { error: 'Internal Server Error' };
      }
    });

  if (loggedUser && loggedUser.error) {
    return response.status(406).send({
      remark: 'Error',
      message: loggedUser.error,
    });
  }

  // set refresh token in cookie
  const cookieOptions = {
    maxAge: 3600000 * 24 * 30,
    path: '/api/v0.0.1/auth/refresh_token',
    domain: `.${process.env.DOMAIN_NAME}`,
    httpOnly: true,
  };

  if (process.env.DOMAIN_NAME !== 'howmies.com') {
    delete cookieOptions.domain;
  }

  response
    .status(200)
    .cookie('HURT', refreshToken, cookieOptions)
    .set('Authorization', accessToken)
    .send({
      message: 'Successfully signed in',
      data: {
        uid,
        name,
        telephone,
        emailAddress,
        expiresIn: `${expiresIn}s`,
        refreshIn: `${exp}s`,
      },
    });
};
