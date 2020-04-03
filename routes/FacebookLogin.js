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

  res
    .status(200)
    .cookie('HURT', user.refreshToken, user.cookieOptions)
    .set('Authorization', user.accessToken)
    .send({
      message: 'Successfully signed up',
      data: {
        uid: user.uid,
        name: user.name,
        email: user.email,
        expiresIn: user.expiresIn,
        refreshIn: user.refreshIn,
      },
    });
});

module.exports = userRouter;
