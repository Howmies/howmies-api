const express = require('express');
const passport = require('passport');

const userData = require('../controllers/FacebookLogin');

const userRouter = express.Router();

userRouter.get('/', passport.authenticate('facebook'));

userRouter.get(
  '/callback',
  passport.authenticate('facebook', {
    successRedirect: '/api/v0.0.1/auth/facebook/success',
    failureRedirect: '/api/v0.0.1/auth/facebook/fail',
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
