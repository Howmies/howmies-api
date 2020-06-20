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
    const userExists = await Users.getByEmailOrPhone(email, phone);
    if (userExists > 0) {
      return res.status(403).send({ message: `Account already exists, please log in at ${req.hostname}/api/v.0.0.1/auth/users/signin` });
    }
  } catch (err) {
    return errorHandler(req, res);
  }

  // hash user password

  const passwordHash = generateHash(password);

  // create user account

  try {
    const { id } = await Users.create(email, phone, passwordHash, firstName, lastName);
    new LoginProcessor(id, `${firstName} ${lastName}`, phone, email)
      .successResponse(res);
  } catch (err) {
    return errorHandler(req, res);
  }
};
