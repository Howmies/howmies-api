const passport = require('passport');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const strategy = require('passport-google-oauth20');
const pool = require('../middleware/configs/elephantsql');
const googleLogin = require('../middleware/configs/googleConfig');
const LoginProcessor = require('../middleware/LoginHandler');

const GoogleStrategy = strategy.Strategy;

dotenv.config();

// Sign Google user up
const salt = bcrypt.genSaltSync(10);

const cryptedGoogleID = (googleID) => bcrypt.hash(googleID, salt);

const loginProcessor = new LoginProcessor();

const registerGoogleUser = async (firstName, lastName, email, googleID, done) => {
  await pool.query(
    `INSERT INTO users(first_name, last_name, email, phone, password, register_date)
    VALUES($1, $2, $3, $4, $5, $6)
    RETURNING *`,
    [
      firstName,
      lastName,
      email,
      cryptedGoogleID(googleID),
      Date.now(),
    ],
    async (err, result) => {
      if (err || (result.rows && result.rows.length === 0)) {
        return done(err);
      }

      loginProcessor.done = done;
      loginProcessor.uid = result.rows[0].id;
      loginProcessor.confirmedLogin = await loginProcessor.loggedUser;
      loginProcessor.username = `${result.rows[0].first_name} ${result.rows[0].last_name}`;
      loginProcessor.telephone = '';
      loginProcessor.email = result.rows[0].email;

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
    async (err, result) => {
      if (err) {
        return done(err);
      }

      if (result.rows && result.rows.length === 0) {
        return registerGoogleUser(firstName, lastName, email, googleID, done);
      }

      if (result.rows && result.rows.length === 1) {
        loginProcessor.done = done;
        loginProcessor.uid = result.rows[0].id;
        loginProcessor.confirmedLogin = await loginProcessor.loggedUser;
        loginProcessor.username = `${result.rows[0].first_name} ${result.rows[0].last_name}`;
        loginProcessor.telephone = '';
        loginProcessor.email = result.rows[0].email;

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
