const express = require('express');
const pool = require('../Elephantsql');
const url = require('url');

const router = express.Router();

router.get('/signup', (req, resp) => {
  resp.send({
    actionMessage: 'Register with the required data',
    requiredData: ['estateAgentName', 'address', 'lga', 'state', 'email', 'mobileNumber', 'officeNumber'],
  });
});

router.post('/signup', (req, resp) => {
  const {
    estateAgentName, address, lga, state, email, officeNumber, mobileNumber,
  } = req.body;
  if (officeNumber === mobileNumber) {
    resp.status(400)
      .send({
        status: resp.statusCode,
        data: { warningMessage: 'mobile number must not be the same as office number' },
      })
      .end();
  } else {
    pool.query('INSERT INTO real_estate_agents(estate_agent_name, address, lga, state, email, mobile_number, office_number) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [estateAgentName, address, lga, state, email, (mobileNumber && mobileNumber.length) ? mobileNumber : null, officeNumber],
      (err, res) => {
        if (err) throw err;
        console.log(res.rows);
        resp.redirect(url.format({
          pathname: '/api/v1/auth/real_estate_agents/login',
          query: {
            successMessage: 'Successfully registered',
            actionMessage: 'Check your phone or email for login details',
          },
        }));
      });
  }
});

router.get('/login', (req, resp) => {
  resp.send({
    passedData: req.query,
    requiredData: ['email', 'password'],
  });
});

module.exports = router;
