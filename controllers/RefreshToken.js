const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const pool = require('../elephantsql');

dotenv.config();

const privateKey = process.env.RSA_PRIVATE_KEY;

module.exports = async (req, response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { return response.status(422).send({ message: errors.array() }); }

  // verify token validation
  const token = req.headers['x-refresh-token'];

  const tokenVerification = jwt.verify(
    token,
    privateKey,
    {
      algorithms: ['HS256'],
      audience: 'user',
      issuer: 'Howmies Entreprise',
      ignoreExpiration: true,
    },
    (err, result) => {
      if (err) {
        return { error: 'Invalid session access' };
      }

      if (result && result.exp) {
        const expiration = Math.floor(result.exp - Date.now() / 1000);
        if (expiration < 0) {
          return { expiration };
        }
      }
    },
  );

  if (tokenVerification && tokenVerification.error) {
    return response.status(403).send({
      status: 'Error',
      message: tokenVerification.error,
    });
  }

  // check against expired token
  if (tokenVerification && tokenVerification.expiration) {
    // remove expired refresh token from database to fully logout user
    const logout = await pool.query(
      'DELETE FROM logged_users WHERE refresh_token=$1',
      [token],
    )
      .then(() => null)
      .catch(() => ({ error: 'Internal Server Error. Try again' }));
    if (logout && logout.error) {
      return response.status(403).send({
        status: 'Error',
        message: logout.error,
      });
    }
    return response.status(403).send({
      status: 'Expired',
      message: 'Refresh token expired. Login to continue',
    });
  }

  // for valid token
  // check for user ID to be used in new token
  const uid = await pool.query(
    'SELECT user_id FROM logged_users WHERE refresh_token=$1',
    [token],
  )
    .then((result) => {
      if (result.rows && result.rows.length > 0) {
        return result.rows[0].user_id;
      }
    })
    .catch(() => null);

  // handle scenario for token absent from database
  if (!uid) {
    return response.status(500).send({
      status: 'Error',
      message: 'Internal Server Error',
    });
  }

  // for valid refresh token
  // sign new access token
  const expiresIn = 1500;
  const aud = 'user';
  const iss = 'Howmies Entreprise';
  const algorithm = 'HS256';
  const accessToken = jwt.sign(
    {
      iss, aud, uid,
    },
    privateKey,
    { expiresIn, algorithm },
  );

  response.status(200).set('Authorization', accessToken).send({
    message: 'Session refresh successful',
  });
};
