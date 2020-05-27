const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const pool = require('../middleware/configs/elephantsql');

dotenv.config();

const privateKey = process.env.RSA_PRIVATE_KEY;

module.exports = async (req, response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { return response.status(422).send({ message: errors.array() }); }

  // verify token validation

  const refreshToken = req.cookies.HURT;

  // const { refreshToken } = req.headers.Authorization;

  const tokenVerification = jwt.verify(
    refreshToken,
    privateKey,
    {
      algorithms: ['HS256'],
      audience: 'user',
      issuer: 'Howmies Entreprise',
      // ignoreExpiration: true,
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

      return result;
    },
  );

  if (tokenVerification && tokenVerification.error) {
    return response.status(403).send({
      remark: 'Error',
      message: tokenVerification.error,
    });
  }

  // check against expired token
  if (tokenVerification && tokenVerification.expiration) {
    // remove expired refresh token from database to fully logout user
    const logout = await pool.query(
      'DELETE FROM logged_users WHERE refresh_token=$1',
      [refreshToken],
    )
      .then(() => null)
      .catch(() => ({ error: 'Internal Server Error. Try again' }));
    if (logout && logout.error) {
      return response.status(403).send({
        remark: 'Error',
        message: logout.error,
      });
    }
    return response.status(403).send({
      remark: 'Expired',
      message: 'Refresh token expired. Login to continue',
    });
  }

  // for valid token

  // for valid refresh token
  // sign new tokens
  // sign access token
  const expiresIn = 1500;
  const aud = 'user';
  const iss = 'Howmies Entreprise';
  const algorithm = 'HS256';
  const newAccessToken = jwt.sign(
    {
      iss, aud, uid: tokenVerification.uid,
    },
    privateKey,
    { expiresIn, algorithm },
  );

  // sign refresh token
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30;
  const newRefreshToken = jwt.sign(
    { exp, uid: tokenVerification.uid },
    privateKey,
    { algorithm, issuer: iss, audience: aud },
  );

  // set cookie options

  const cookieOptions = {
    maxAge: 3600000 * 24 * 30,
    path: '/api/v0.0.1/auth/refresh_token',
    domain: process.env.DOMAIN_NAME,
    httpOnly: false,
    sameSite: 'none',
    // secure: true,
  };

  response.status(200)
    .cookie('HURT', newRefreshToken, cookieOptions)
    .set('Authorization', JSON.stringify({ newAccessToken, newRefreshToken }))
    .send({
      message: 'Session refresh successful',
    });
};
