const passport = require('passport');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const strategy = require('passport-facebook');
const pool = require('../middleware/configs/elephantsql');
const facebookLogin = require('../middleware/configs/facebookConfig');
const LoginProcessor = require('../middleware/LoginHandler');

const FacebookStrategy = strategy.Strategy;

dotenv.config();

// Sign Facebook user up
const salt = bcrypt.genSaltSync(10);

const cryptedFacebookID = (facebookID) => bcrypt.hashSync(facebookID, salt);

const registerFacebookUser = async (firstName, lastName, email, facebookID, done) => {
  await pool.query(
    `INSERT INTO users(first_name, last_name, email, password, register_date)
    VALUES($1, $2, $3, $4, $5)
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

// Check if Facebook user is an in-app registered user
const checkRegisteredUser = async (email, done, firstName, lastName, facebookID) => {
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
        return registerFacebookUser(firstName, lastName, email, facebookID, done);
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
  new FacebookStrategy(
    facebookLogin,
    ((accessTokenHowmies, refreshTokenHowmies, profile, done) => {
      const {
        email, id, first_name, last_name,
      } = profile._json;

      return checkRegisteredUser(email, done, first_name, last_name, id);
    }),
  ),
);
