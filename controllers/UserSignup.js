const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const pool = require('../middleware/configs/elephantsql');
const LoginProcessor = require('../middleware/LoginHandler');

dotenv.config();

const salt = bcrypt.genSaltSync(10);

module.exports = async (req, response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { return response.status(422).send({ message: errors.array() }); }

  const {
    firstName,
    lastName,
    email,
    phone,
    password,
  } = req.body;

  const existingUser = await pool.query('SELECT email, phone FROM users WHERE email=$1 OR phone=$2',
    [email, phone])
    .then((result) => {
      if (result.rows && result.rows.length > 0) {
        return {
          error: {
            status: 403,
            message: 'Account already in use. Try to login with your email and password. Or register with another email or phone number',
          },
        };
      }
    })
    .catch(() => ({
      error: {
        status: 500,
        message: 'Internal Server Error. Try again',
      },
    }));

  if (existingUser && existingUser.error) {
    return response.status(existingUser.error.status).send({
      remark: 'Error',
      message: existingUser.error.message,
    });
  }

  const passwordCrypt = bcrypt.hashSync(password, salt);

  const user = await pool.query(
    `INSERT INTO users(first_name, last_name, email, phone, password, register_date)
    VALUES($1, $2, $3, $4, $5, $6)
    RETURNING *`,
    [firstName,
      lastName,
      email,
      phone,
      passwordCrypt,
      Date.now(),
    ],
  )
    .then((result) => {
      if (result.rows
        && result.rows.length > 0
        && bcrypt.compareSync(password, result.rows.find((e) => e.email === email).password)) {
        return {
          data: {
            uid: result.rows[0].id,
            name: `${result.rows[0].first_name} ${result.rows[0].last_name}`,
            telephone: result.rows[0].phone,
            emailAddress: result.rows[0].email,
          },
        };
      }
    })
    .catch((err) => ({
      error: err.message.includes('duplicate')
        ? {
          status: 403,
          message: 'Account already in use',
        } : {
          status: 500,
          message: 'Internal Server Error',
        },
    }));

  if (!user) {
    return response.status(500).send({
      remark: 'Error',
      message: 'Internal Server Error',
    });
  }

  if (user && user.error) {
    return response.status(user.error.status).send({
      remark: 'Error',
      message: user.error.message,
    });
  }

  const {
    uid, name, telephone, emailAddress,
  } = user.data;

  const loginProcessor = new LoginProcessor();

  loginProcessor.uid = uid;
  loginProcessor.confirmedLogin = await loginProcessor.loggedUser;
  loginProcessor.username = name;
  loginProcessor.telephone = telephone;
  loginProcessor.email = emailAddress;
  loginProcessor.successResponse(response);
};
