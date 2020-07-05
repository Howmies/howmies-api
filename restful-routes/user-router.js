const express = require('express');
const requestSessionValidator = require('../middleware/request_validator/sessions-validator');
const sessionHandler = require('../middleware/sessions');
const requestSessionValidatorHandler = require('../middleware/sessions-validator-handler');

const userRouter = express.Router();

const authUserRouter = express.Router();

userRouter.route('/Users')
  .get((req, res) => {
    if (req.query) {
      return res
        .status(200)
        .json({ data: 'users data' });
    }
  })
  .post((req, res) => res
    .status(201)
    .json({ data: 'new user\'s data' }));

userRouter.route('/Users/:userId')
  .get((req, res) => {
    if (req.params.userId) {
      return res
        .status(200)
        .json({ data: 'user data' });
    }
  });

authUserRouter
  .use('/auth/Users', requestSessionValidator)
  .use('/auth/Users', sessionHandler)
  .use('/auth/Users', requestSessionValidatorHandler);

authUserRouter.route('/auth/Users')
  .get((req, res) => {
    if (req.headers.authorization) {
      return res
        .status(200)
        .json({ data: 'user data' });
    }
  })
  .put((req, res) => {
    if (req.headers.authorization) {
      return res
        .status(200)
        .json({ data: 'user data' });
    }
  })
  .delete((req, res) => {
    if (req.headers.authorization) {
      return res
        .status(200)
        .json({ data: 'user data' });
    }
  });

module.exports = { userRouter, authUserRouter };
