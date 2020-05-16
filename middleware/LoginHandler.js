const passport = require('passport');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const pool = require('./configs/elephantsql');

dotenv.config();

// Passport pre-use

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// hash user password or external passport id

module.exports = class {
  constructor() {
    // user token options

    const { uid } = this;

    const expiresIn = 1500;
    const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30;
    const aud = 'in-app Facebook user';
    const iss = 'Howmies Entreprise';
    const data = 'refresh in-app Facebook user';
    const algorithm = 'HS256';

    const tokenKeys = {
      keyPrivate: process.env.RSA_PRIVATE_KEY,
      keyPublic: process.env.RSA_PUBLIC_KEY,
    };

    const accessToken = jwt.sign(
      { iss, aud, uid },
      tokenKeys.keyPrivate,
      { expiresIn, algorithm },
    );

    const refreshToken = jwt.sign(
      { exp, data },
      tokenKeys.keyPrivate,
      { algorithm, issuer: iss, audience: aud },
    );

    // set cookie options

    const cookieOptions = {
      maxAge: 3600000 * 24 * 30,
      path: '/api/v0.0.1/auth/refresh_token',
      domain: `.${process.env.DOMAIN_NAME}`,
      httpOnly: true,
    };

    // log user in

    const loggedUser = pool.query(
      'INSERT INTO logged_users(user_id, refresh_token) VALUES($1, $2)',
      [uid, refreshToken],
    )
      .then(() => null)
      .catch((err) => {
        if (!err) {
          return { error: 'Internal Server Error' };
        }
      });

    this.loggedUser = loggedUser;
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.cookieOptions = cookieOptions;
    this.expiresIn = expiresIn;
    this.exp = exp;
  }

  successResponse(res) {
    const { confirmedLogin } = this;

    if (confirmedLogin && confirmedLogin.error) {
      if (this.done) {
        return this.done(confirmedLogin.error);
      }
      return res.status(406).send({
        remark: 'Error',
        message: confirmedLogin.error,
      });
    }

    const {
      accessToken, refreshToken, cookieOptions, uid,
      username, telephone, email, expiresIn, exp,
    } = this;

    return res
      .status(200)
      .cookie('HURT', refreshToken, cookieOptions)
      .set('Authorization', accessToken)
      .send({
        message: 'Successfully logged in',
        data: {
          uid,
          username,
          telephone,
          email,
          expiresIn: `${expiresIn}s`,
          refreshIn: `${exp}s`,
        },
      });
  }
};
