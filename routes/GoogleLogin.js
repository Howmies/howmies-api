const express = require('express');
const passport = require('passport');

const userData = require('../controllers/GoogleLogin');

const userRouter = express.Router();

userRouter.get('/', passport.authenticate('google', {
  scope: [
    'profile',
    'email',
  ],
}));

userRouter.get(
  '/callback',
  passport.authenticate('google', {
    successRedirect: '/api/v0.0.1/auth/google/success',
    failureRedirect: '/api/v0.0.1/auth/google/fail',
  }),
);

userRouter.get('/fail', (req, res) => {
  res.send('Failed attempt');
});

userRouter.get('/success', (req, res) => {
  const user = userData.loggedUser || userData.newUser;

  user.loginProcessor.successResponse(res);
});

module.exports = userRouter;
