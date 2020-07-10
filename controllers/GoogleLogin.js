const passport = require('passport');
const strategy = require('passport-google-oauth20');
const googleLogin = require('../configs/googleConfig');
const UserModel = require('../models/users-model');
const HashHandler = require('../utils/hash-handler');
const LoginProcessor = require('../utils/login-handler');

const GoogleStrategy = strategy.Strategy;

// Sign up Google user

const registerGoogleUser = async (firstName, lastName, email, googleID, done) => {
  const passwordHash = HashHandler.generateHash(googleID);
  try {
    const newUser = await UserModel.create(
      email, null, passwordHash, firstName, lastName,
    );

    const uid = newUser.id;
    const username = `${newUser.first_name} ${newUser.last_name}`;
    const telephone = '';
    const userEmail = newUser.email;

    const loginProcessor = new LoginProcessor(uid, username, telephone, userEmail);
    const user = { loginProcessor };
    module.exports.newUser = user;

    return done(null, user);
  } catch (error) {
    return done(JSON.stringify({
      remark: 'Error',
      message: 'Internal server error',
    }));
  }
};

// Check if Google user is an in-app registered user
const checkRegisteredUser = async (email, done, firstName, lastName, googleID) => {
  try {
    const existingUser = await UserModel.getByEmail(email);
    if (!existingUser) {
      return registerGoogleUser(firstName, lastName, email, googleID, done);
    }

    const uid = existingUser.id;
    const username = `${existingUser.first_name} ${existingUser.last_name}`;
    const telephone = '';
    const userEmail = existingUser.email;

    const loginProcessor = new LoginProcessor(uid, username, telephone, userEmail);
    const user = { loginProcessor };
    module.exports.loggedUser = user;

    return done(null, user);
  } catch (error) {
    return done(JSON.stringify({
      remark: 'Error',
      message: 'Internal server error',
    }));
  }
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
