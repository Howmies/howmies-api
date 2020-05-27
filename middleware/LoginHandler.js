const passport = require('passport');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

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
  constructor(uid) {
    // user token options

    const expiresIn = 600;
    const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30;
    const aud = 'user';
    const iss = 'Howmies Entreprise';
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
      { exp, uid },
      tokenKeys.keyPrivate,
      { algorithm, issuer: iss, audience: aud },
    );

    // set cookie options

    const cookieOptions = {
      maxAge: 3600000 * 24 * 30,
      path: '/api/v0.0.1/auth/refresh_token',
      domain: process.env.DOMAIN_NAME,
      httpOnly: false,
      sameSite: 'none',
      secure: true,
    };

    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.cookieOptions = cookieOptions;
    this.expiresIn = expiresIn;
    this.exp = exp;
    this.uid = uid;
  }

  successResponse(res, username, telephone, email) {
    const {
      accessToken, refreshToken, cookieOptions, uid,
      expiresIn, exp,
    } = this;

    return res
      .status(200)
      .cookie('HURT', refreshToken, cookieOptions)
      .set('Authorization', JSON.stringify({ accessToken, refreshToken }))
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
