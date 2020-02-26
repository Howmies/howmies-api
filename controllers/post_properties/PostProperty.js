const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const pool = require('../../elephantsql');

dotenv.config();

module.exports = async (req, res, next) => {
  // verify session
  const user = await jwt.verify(
    req.headers.authorization,
    process.env.RSA_PRIVATE_KEY,
    { algorithms: ['HS256'] },
    (err, result) => {
      if (err) {
        console.log({
          status: err.name,
          message: err.message,
        });
        return;
      }

      const expiration = (Math.floor(result.exp / 1000) + (60 * 15))
        - Math.floor(Date.now() / 1000);

      if (expiration < 1) {
        console.log({
          status: 'tokenExpError',
          message: `Expired session at ${expiration}s ago`,
        });
      } else {
        console.log({
          uid: result.uid,
          exp: `Session until ${expiration}s`,
        });

        return result;
      }
    },
  );

  if (!user || !user.uid || !user.role) {
    return res.status(403).send({
      status: 'Error',
      message: 'Invalid session access',
    });
  }

  const { uid } = user;
  const { role } = user;

  if (role !== 'user') {
    return res.status(403).send({
      status: 'Error',
      message: 'Unauthorized request. Login or Sign up to continue.',
    });
  }

  // verify user
  const ownerID = await pool.query('SELECT user_id FROM users WHERE user_id=$1', [uid])
    .then((result) => result.rows[0].user_id)
    .catch((err) => console.log(err));

  if (!ownerID) {
    return res.status(403).send({
      status: 'Error',
      message: 'Could not validate user. Login or Sign up to continue.',
    });
  }

  // verify property details by user
  const errors = validationResult(req);

  if (!errors.isEmpty()) { return res.status(422).send({ message: errors.array() }); }

  // get user input
  const {
    type, state, lga, address, status, price, period, description, phone, email,
  } = req.body;

  // verify property type
  const propertyType = await pool.query('SELECT property_type_id FROM property_types WHERE property_type_name=$1',
    [type.toLowerCase()])
    .then((result) => result.rows[0].property_type_id)
    .catch((err) => console.log(err));

  if (!propertyType) {
    return res.status(403).send({
      status: 'Error',
      message: 'Invalid property type',
    });
  }

  // verify status type
  const statusID = await pool.query('SELECT status_id FROM status_types WHERE status_name=$1',
    [status.toLowerCase()])
    .then((result) => result.rows[0].period_id)
    .catch((err) => console.log(err));
  console.log(`statusID: ${statusID}`);

  if (!statusID) {
    return res.status(403).send({
      status: 'Error',
      message: 'Invalid renewal period',
    });
  }

  // verify status period
  const perPeriod = await pool.query('SELECT period_id FROM status_periods WHERE period_name=$1',
    [period.toLowerCase()])
    .then((result) => result.rows[0].period_id)
    .catch((err) => console.log(err));
  console.log(`perPeriod: ${perPeriod}`);

  if (!perPeriod) {
    return res.status(403).send({
      status: 'Error',
      message: 'Invalid renewal period',
    });
  }

  // save other property details to properties table
  await pool.query(
    'INSERT INTO properties(owner_id,  property_type, state, lga, address, status_type, price, status_period,  property_description, property_phone, property_email, post_date) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING property_id',
    [
      ownerID,
      propertyType,
      state,
      lga,
      address,
      statusID,
      price,
      perPeriod,
      description,
      phone,
      email,
      (new Date()).toUTCString(),
    ],
  )
    .then((propertyResult) => {
      res.locals.propertyID = propertyResult.rows[0].property_id;

      if (req.body.features) {
        res.locals.features = req.body.features;
      }
      next();
    })
    .catch((err) => res.status(500).send({
      status: err.name,
      message: err.message,
    }));
};
