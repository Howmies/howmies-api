const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const pool = require('../elephantsql');

dotenv.config();

module.exports = async (req, res) => {
  // verify session
  const user = await jwt.verify(
    req.headers.authorization,
    process.env.RSA_PRIVATE_KEY,
    { algorithms: ['HS256'] },
    (err, result) => {
      if (err) {
        return console.log({
          status: err.name,
          message: err.message,
        });
      }

      const expiration = Math.floor(result.exp - Date.now() / 1000);

      if (expiration < 1) console.log(`Expired session at ${expiration}s ago`);
      else {
        console.log(`Session until ${expiration}s`);

        return result;
      }
    },
  );

  if (!user || !user.role || !user.uid) {
    return res.status(403).send({
      status: 'Error',
      message: 'Invalid session access',
    });
  }

  const { uid, role } = user;

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

  if (!errors.isEmpty()) {
    return res.status(422).send({ message: errors.array() });
  }

  // get user input
  const {
    type, state, lga, address, status, price, period, description, phone, email, features,
  } = req.body;

  // verify property type
  const propertyType = await pool.query('SELECT id FROM property_types WHERE property_name=$1',
    [type.toLowerCase()])
    .then((result) => result.rows[0].id)
    .catch((err) => console.log(err));

  if (!propertyType) {
    return res.status(403).send({
      status: 'Error',
      message: 'Invalid property type',
    });
  }

  // verify status type
  const statusID = await pool.query('SELECT id FROM status_types WHERE status_name=$1',
    [status.toLowerCase()])
    .then((result) => result.rows[0].id)
    .catch((err) => console.log(err));

  if (!statusID) {
    return res.status(403).send({
      status: 'Error',
      message: 'Invalid property type',
    });
  }

  // verify status period
  const perPeriod = await pool.query('SELECT id FROM status_periods WHERE period_name=$1',
    [period.toLowerCase()])
    .then((result) => result.rows[0].id)
    .catch((err) => console.log(err));

  if (!perPeriod) {
    return res.status(403).send({
      status: 'Error',
      message: 'Invalid lease period',
    });
  }

  // save other property details to properties table
  const pID = await pool.query(
    `INSERT INTO
    properties(
      owner_id, property_type, state, lga, address, status_type, price,
      period, property_desc, property_phone, property_email, post_date
    )
    VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING property_id`,
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
      Date.now(),
    ],
  )
    .then((propertyResult) => propertyResult.rows[0].property_id)
    .catch((err) => {
      console.log(err);
      res.status(500).send({
        status: err.name,
        message: 'Internal server error',
      });
    });

  // handle property features request
  if (features) {
    // verify property type
    if (!pID) {
      console.log('Property ID not found');
      return res.status(500).send({
        status: 'Error',
        message: 'Internal server error',
      });
    }

    // check for already available features
    const selectArr = () => {
      let text = '';
      for (let i = 0; i < features.length; i += 1) {
        if (i === features.length - 1) {
          text += features[i].toLowerCase();
        } else {
          text += `${features[i].toLowerCase()}, `;
        }
      }
      return text;
    };

    const availableFeatures = await pool.query(
      `SELECT id, feature_name FROM features
      WHERE feature_name = ANY('{${selectArr()}}'::text[]);`,
    )
      .then((result) => result.rows)
      .catch((err) => console.log(`Error: Error selecting feature id ${err}`));

    if (!availableFeatures) {
      return res.status(500).send({
        status: 'Error',
        message: 'Internal server error',
      });
    }

    // check for new features
    const newFeatures = (availableFeatures.length > 0)
      ? features.filter(
        (e) => !availableFeatures.map((element) => element.feature_name).includes(e),
      ) : null;
    console.log(`new features: ${newFeatures}`);

    // insert new features to database
    const insertArr = (newFeatures && newFeatures.length > 0) ? () => {
      let text = '';
      for (let i = 0; i < newFeatures.length; i += 1) {
        if (i === newFeatures.length - 1) {
          text += `('${newFeatures[i].toLowerCase()}')`;
        } else {
          text += `('${newFeatures[i].toLowerCase()}'), `;
        }
      }
      return text;
    } : null;

    const currentFeatures = (insertArr) ? await pool.query(
      `INSERT INTO features(feature_name)
        VALUES${insertArr()}
      RETURNING id;`,
    )
      .then((result) => result.rows.map((e) => e.id).concat(availableFeatures.map((e) => e.id)))
      .catch((err) => console.log(`Error: Error inserting feature id: ${err}`))
      : availableFeatures.map((e) => e.id);
    console.log(currentFeatures);

    if (!currentFeatures) {
      return res.status(500).send({
        status: 'Error',
        message: 'Internal server error',
      });
    }

    // fill the property-features relationship
    const insertArrPF = () => {
      let text = '';
      for (let i = 0; i < currentFeatures.length; i += 1) {
        if (i === currentFeatures.length - 1) {
          text += `(${currentFeatures[i]}, ${pID})`;
        } else {
          text += `(${currentFeatures[i]}, ${pID}), `;
        }
      }
      return text;
    };

    pool.query(
      `INSERT INTO properties_features(feature_id, property_id)
        VALUES${insertArrPF()};`,
    )
      .catch((err) => console.log(err));
  }

  // retrieve property details for response
  const data = {};

  data.data = await pool.query(
    `SELECT
      p.address AS p_address, p.lga AS p_lga, p.state AS p_state, p.price AS p_price, p.property_phone AS p_phone, p.property_email AS p_email,
      t.property_name AS t_property, s.status_name AS s_status, r.period_name AS r_period
    FROM
      properties AS p,
      property_types AS t,
      status_types AS s,
      status_periods AS r
    WHERE
      p.property_id=$1
      AND t.id=p.property_type
      AND s.id=p.status_type
      AND r.id=p.period;`,
    [pID],
  )
    .then((result) => ({
      contactDetails: {
        phone: result.rows[0].p_phone,
        email: result.rows[0].p_email,
      },
      location: {
        addr: result.rows[0].p_address,
        lga: result.rows[0].p_lga,
        state: result.rows[0].p_state,
      },
      propertyType: result.rows[0].t_property,
      statusType: result.rows[0].s_status,
      duration: result.rows[0].r_period,
    }))
    .catch((err) => console.log(`\nError: Error getting property details ${err}`));

  if (!data.data) {
    return res.status(500).send({
      status: 'Error',
      message: 'Internal server error',
    });
  }

  // retrieve features for response if they exist
  if (features && features.length > 0 && data && data.data) {
    data.data.features = await pool.query(
      `SELECT
      f.feature_name AS feature
    FROM
      features AS f,
      properties_features AS pf
    WHERE
      pf.property_id=$1
      AND f.id=pf.feature_id;`,
      [pID],
    )
      .then((result) => result.rows.map((e) => e.feature))
      .catch((err) => console.log(`\nError: Error getting property features ${err}`));

    if (!data.data.features) {
      return res.status(500).send({
        status: 'Error',
        message: 'Internal server error',
      });
    }
  }

  res.status(200).send({
    message: 'Property posted successfully',
    data: data.data,
  });
};
