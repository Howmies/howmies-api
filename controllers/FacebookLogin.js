const passport = require('passport');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const strategy = require('passport-facebook');
const pool = require('../elephantsql');
const facebookLogin = require('../middleware/facebookConfig');

const FacebookStrategy = strategy.Strategy;

dotenv.config();

// sign token
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

const accessToken = (uid) => jwt.sign(
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

// log in-app Facebook user in
const loginUser = async (uid, done) => {
  await pool.query(
    'INSERT INTO logged_users(user_id, refresh_token) VALUES($1, $2)',
    [uid, refreshToken],
    (loginUserErr) => {
      if (loginUserErr) {
        return done(loginUserErr);
      }
    },
  );

  return null;
};

// Sign Facebook user up
const salt = bcrypt.genSaltSync(10);

const cryptedFacebookID = (facebookID) => bcrypt.hashSync(facebookID, salt);

const registerFacebookUser = async (firstName, lastName, email, facebookID, done) => {
  await pool.query(
    `INSERT INTO users(first_name, last_name, email, phone, password, register_date)
    VALUES($1, $2, $3, $4, $5, $6)
    RETURNING *`,
    [
      firstName,
      lastName,
      email,
      cryptedFacebookID(facebookID),
      Date.now(),
    ],
    (err, result) => {
      if (err || (result.rows && result.rows.length === 0)) {
        return done(err);
      }

      loginUser(result.rows[0].id, done);
      const user = {
        uid: result.rows[0].id,
        name: `${result.rows[0].first_name} ${result.rows[0].last_name}`,
        email: result.rows[0].email,
        accessToken: accessToken(result.rows[0].id),
        refreshToken,
        expiresIn: `${expiresIn}s`,
        refreshIn: `${exp}s`,
        cookieOptions,
      };

      module.exports.newUser = user;
      return done(null, user);
    },
  );

  return null;
};

// Check if Facebook user is an in-app registered user
const checkRegisteredUser = async (email, done, firstName, lastName, facebookID) => {
  await pool.query(
    'SELECT * FROM users WHERE email=$1',
    [email],
    (err, result) => {
      if (err) {
        return done(err);
      }

      if (result.rows && result.rows.length === 0) {
        return registerFacebookUser(firstName, lastName, email, facebookID, done);
      }

      if (result.rows && result.rows.length === 1) {
        loginUser(result.rows[0].id, done);
        const user = {
          uid: result.rows[0].id,
          name: `${result.rows[0].first_name} ${result.rows[0].last_name}`,
          email: result.rows[0].email,
          accessToken: accessToken(result.rows[0].id),
          refreshToken,
          expiresIn: `${expiresIn}s`,
          refreshIn: `${exp}s`,
          cookieOptions,
        };

        module.exports.loggedUser = user;
        return done(null, user);
      }
    },
  );

  return null;
};

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

passport.use(
  new FacebookStrategy(
    facebookLogin,
    ((accessTokenHowmies, refreshTokenHowmies, profile, done) => {
      const {
        email, id, first_name, last_name,
      } = profile._json;

      const user = {
        email,
        uid: id,
        firstName: first_name,
        lastName: last_name,
      };

      return checkRegisteredUser(user.email, done, user.firstName, user.lastName, id);
    }),
  ),
);
