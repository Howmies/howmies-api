const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const LoginProcessor = require('../utils/login-handler');

dotenv.config();

const privateKey = process.env.RSA_PRIVATE_KEY;

module.exports = async (req, response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { return response.status(422).send({ message: errors.array() }); }

  // verify token validation

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
    response
      .status(403)
      .clearCookie('HURT', { path: '/api/v0.0.1/auth/refresh_token' })
      .removeHeader('Authorization');
    return response.send({
      remark: 'Error',
      message: tokenVerification.error,
    });
  }

  // for valid token, auto sign-in user

  const {
    uid, data,
  } = tokenVerification;

  const {
    username, telephone, email,
  } = data;

  const loginProcessor = new LoginProcessor(uid, username, telephone, email);

  loginProcessor.successResponse(response);
};
