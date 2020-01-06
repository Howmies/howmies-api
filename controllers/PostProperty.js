const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const pool = require('../elephantsql');

dotenv.config();

if (dotenv.config().error) throw dotenv.config().error;

exports.postProperty = (req, response) => {
  jwt.verify(req.headers.Authorization, process.env.RSA_PRIVATE_KEY, {});
  const errors = validationResult(req);
  if (!errors.isEmpty()) { return response.status(422).send({ message: errors.array() }); }

  const {
    type, address, lga, state, images, price, period, description, features,
  } = req.body;
};
