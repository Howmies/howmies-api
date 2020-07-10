const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const LoginProcessor = require('../utils/login-handler');
const User = require('../models/users-model');
const errorHandler = require('../utils/error-handler');

dotenv.config();

const privateKey = process.env.RSA_PRIVATE_KEY;

module.exports = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { return res.status(422).send({ message: errors.array() }); }

  // verify refresh token

  const refreshToken = req.cookies.HURT;

  // const { refreshToken } = req.headers.Authorization;

  const tokenVerification = jwt.verify(
    refreshToken,
    privateKey,
    {
      algorithms: ['HS256'],
      audience: 'user',
      issuer: 'Howmies Entreprise',
    },
    (err, result) => {
      if (err) return { error: 'Invalid session access' };
      return result;
    },
  );

  // check against expired token

  if (tokenVerification && tokenVerification.error) {
    res
      .status(403)
      .clearCookie('HURT', { path: '/api/v0.0.1/auth/refresh_token' })
      .removeHeader('Authorization');
    return res.send({
      remark: 'Error',
      message: tokenVerification.error,
    });
  }

  // for valid token, auto sign-in user

  const {
    uid, data, _v,
  } = tokenVerification;

  const {
    username, telephone, email,
  } = data;

  // ensure the current user is the real account owner or allowed user

  try {
    const realUser = await User.countByEmailAndAuthVersion(email, _v);
    if (realUser !== 1) throw new Error('Login with the updated password');
  } catch (error) {
    return errorHandler(req, res, 403);
  }

  const loginProcessor = new LoginProcessor(uid, _v, username, telephone, email);

  loginProcessor.successResponse(res);
};
