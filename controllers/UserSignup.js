const dotenv = require('dotenv');
const { validationResult } = require('express-validator');
const Users = require('../models/users-model');
const errorHandler = require('../utils/error-handler');
const { generateHash } = require('../utils/hash-handler');
const LoginProcessor = require('../utils/login-handler');

dotenv.config();

module.exports = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { return res.status(422).send({ message: errors.array() }); }

  const {
    firstName,
    lastName,
    email,
    phone,
    password,
  } = req.body;

  // check if user already exists

  try {
    const userExists = await Users.countByEmailOrPhone(email, phone);
    if (userExists > 0) {
      const message = 'Phone number or email already exists. Please login or sign up with a new credential.';
      return errorHandler(req, res, 403, message);
    }
  } catch (err) {
    return errorHandler(req, res);
  }

  // hash user password

  const passwordHash = generateHash(password);

  // create user account

  try {
    const { id, _v } = await Users.create(email, phone, passwordHash, firstName, lastName);
    new LoginProcessor(id, _v, `${firstName} ${lastName}`, phone, email)
      .successResponse(res, 201);
  } catch (err) {
    return errorHandler(req, res);
  }
};
