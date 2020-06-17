const passport = require('passport');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const strategy = require('passport-google-oauth20');
const pool = require('../configs/elephantsql');
const googleLogin = require('../configs/googleConfig');
const LoginProcessor = require('../utils/LoginHandler');

const GoogleStrategy = strategy.Strategy;

dotenv.config();

// Sign Google user up
const salt = bcrypt.genSaltSync(10);

const cryptedGoogleID = (googleID) => bcrypt.hash(googleID, salt);

const registerGoogleUser = async (firstName, lastName, email, googleID, done) => {
  await pool.query(
    `INSERT INTO users(first_name, last_name, email, password, register_date)
    VALUES($1, $2, $3, $4, $5)
    RETURNING *`,
    [
      firstName,
      lastName,
      email,
      cryptedGoogleID(googleID),
      Date.now(),
    ],
    (err, result) => {
      if (err || (result.rows && result.rows.length === 0)) {
        return done(JSON.stringify({
          remark: 'Error',
          message: 'Internal server error',
        }));
      }

      const uid = result.rows[0].id;
      const username = `${result.rows[0].first_name} ${result.rows[0].last_name}`;
      const telephone = '';
      const userEmail = result.rows[0].email;

      const loginProcessor = new LoginProcessor(uid, username, telephone, userEmail);

      const user = { loginProcessor };

      module.exports.newUser = user;
      return done(null, user);
    },
  );

  return null;
};

// Check if Google user is an in-app registered user
const checkRegisteredUser = async (email, done, firstName, lastName, googleID) => {
  await pool.query(
    'SELECT * FROM users WHERE email=$1',
    [email],
    (err, result) => {
      if (err) {
        return done(JSON.stringify({
          remark: 'Error',
          message: 'Internal server error',
        }));
      }

      if (result.rows && result.rows.length === 0) {
        return registerGoogleUser(firstName, lastName, email, googleID, done);
      }

      if (result.rows && result.rows.length === 1) {
        const uid = result.rows[0].id;
        const username = `${result.rows[0].first_name} ${result.rows[0].last_name}`;
        const telephone = '';
        const userEmail = result.rows[0].email;

        const loginProcessor = new LoginProcessor(uid, username, telephone, userEmail);

        const user = { loginProcessor };

        module.exports.loggedUser = user;
        return done(null, user);
      }
    },
  );

  return null;
};

passport.use(
  new GoogleStrategy(
    googleLogin,
    ((accessTokenHowmies, refreshTokenHowmies, profile, done) => {
      const {
        email, sub, given_name, family_name,
      } = profile._json;

      return checkRegisteredUser(email, done, given_name, family_name, sub);
    }),
  ),
);
