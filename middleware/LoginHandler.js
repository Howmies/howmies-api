const passport = require('passport');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
// const pool = require('../middleware/configs/elephantsql');

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
  /**
   * Successfully log user in after all checks and other requirements have been fulfilled.
   * @param {Number} uid The user id.
   * @param {String} username The first name and last name of the user.
   * @param {String} telephone The telephone number of the user.
   * @param {String} email The email address of the user.
   */
  constructor(uid, username, telephone, email) {
    // user access token options

    const expiresIn = 15;
    const aud = 'user';
    const iss = 'Howmies Entreprise';
    const algorithm = 'HS256';

    const tokenSecret = {
      keyPrivate: process.env.RSA_PRIVATE_KEY,
      keyPublic: process.env.RSA_PUBLIC_KEY,
    };

    const accessToken = jwt.sign(
      { iss, aud, uid },
      tokenSecret.keyPrivate,
      { expiresIn, algorithm },
    );

    // user refresh token options

    const exp = Math.floor(Date.now() / 1000) + 30;

    const data = {
      username,
      telephone,
      email,
    };

    const refreshToken = jwt.sign(
      { exp, uid, data },
      tokenSecret.keyPrivate,
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

    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.cookieOptions = cookieOptions;
    this.expiresIn = expiresIn;
    this.exp = exp;
    this.uid = uid;

    this.username = username;
    this.telephone = telephone;
    this.email = email;
  }

  /**
   * Successfully log user in after all checks and other requirements have been fulfilled.
   * @param {Response} res Express.js HTTP response.
   * @returns {Response} Express.js HTTP response.
   */
  successResponse(res) {
    const {
      accessToken, refreshToken, cookieOptions, uid,
      expiresIn, username, telephone, email,
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
          expiresIn: expiresIn * 1000,
        },
      });
  }
};
