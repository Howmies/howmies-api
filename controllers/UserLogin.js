const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const pool = require('../middleware/configs/elephantsql');
const LoginProcessor = require('../middleware/LoginHandler');

dotenv.config();

module.exports = async (req, response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { return response.status(422).send({ message: errors.array() }); }

  const { email, password } = req.body;

  const user = await pool.query('SELECT * FROM users WHERE email=$1',
    [email])
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
    .catch(() => ({ error: 'Internal Server Error. Try again' }));

  if (user && user.error) {
    return response.status(500).send({
      remark: 'Error',
      message: user.error,
    });
  }

  if (!user || user.data) {
    return response.status(406).send({
      remark: 'Error',
      message: 'Incorrect email or password',
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
