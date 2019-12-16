const express = require('express');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../elephantsql');

const router = express.Router();

const tokenKeys = {
  keyPrivate: fs.readFileSync(path.resolve(__dirname, '../secrets/rsa_1024_priv.pem')),
  keyPublic: fs.readFileSync(path.resolve(__dirname, '../secrets/rsa_1024_pub.pem')),
};

const salt = bcrypt.genSaltSync(10);

const expiresIn = '30 minutes';

router.post('/signup', (req, response) => {
  const {
    agentName, address, lga, state, email, officeNumber, mobileNumber, password,
  } = req.body;
  const passwordCrypt = bcrypt.hashSync(password, salt);
  const token = jwt.sign({ email, passwordCrypt }, tokenKeys.keyPrivate, { expiresIn });

  if (officeNumber === mobileNumber) {
    response.status(400)
      .send({
        status: response.statusCode,
        data: { warningMessage: 'mobile number must not be the same as office number' },
      })
      .end();
  } else {
    pool.query('INSERT INTO real_estate_agents(agent_name, address, lga, state, email, office_number, mobile_number, agent_password) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [agentName,
        address,
        lga,
        state,
        email,
        officeNumber,
        (mobileNumber && mobileNumber.length) ? mobileNumber : null,
        passwordCrypt],
      (err, result) => {
        if (err) throw err;

        console.log(result.rows);
        response.send({
          token,
          agentName: result.rows[0].agent_name,
        });
      });
  }
});

module.exports = router;
