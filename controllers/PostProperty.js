const dotenv = require('dotenv');
const { validationResult } = require('express-validator');
const pool = require('../middleware/configs/elephantsql');
const sessionValidator = require('../middleware/SessionValidator');

dotenv.config();

module.exports = async (req, res) => {
  // verify session
  const tokenVerifier = sessionValidator(
    req.headers.Authorization,
    process.env.RSA_PRIVATE_KEY,
    'user',
  );

  if (tokenVerifier && tokenVerifier.expiration) {
    return res.status(401).send({
      remark: 'Expired',
      message: tokenVerifier.expiration,
    });
  }

  if ((tokenVerifier && tokenVerifier.error)
    || (tokenVerifier && !tokenVerifier.user)) {
    return res.status(403).send({
      remark: 'Error',
      message: 'Invalid session access',
    });
  }

  const { uid } = tokenVerifier.user;

  // verify property details by user
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).send({ message: errors.array() });
  }

  // get user input
  const {
    type, state, lga, address, status, price, period, description, phone, email, features,
  } = req.body;

  // save other property details to properties table
  const pID = await pool.query(
    `INSERT INTO properties(
      owner_id, property_type, state, lga, address, status_type, price,
      period, property_desc, property_phone, property_email, post_date
    )
    SELECT $1, property_types.id, $3, $4, $5, status_types.id, $7, status_periods.id, $9, $10, $11, $12
      FROM property_types, status_types, status_periods
      WHERE property_types.property_name=$2 AND status_types.status_name=$6 AND status_periods.period_name=$8
    RETURNING property_id`,
    [
      uid,
      type,
      state,
      lga,
      address,
      status,
      price,
      period,
      description,
      phone,
      email,
      Date.now(),
    ],
  )
    .then((propertyResult) => propertyResult.rows[0].property_id)
    .catch(() => null);

  // verify property type
  if (!pID) {
    return res.status(500).send({
      remark: 'Error',
      message: 'Internal server error',
    });
  }

  // handle property features request
  if (features) {
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
      .catch(() => null);

    if (!availableFeatures) {
      return res.status(500).send({
        remark: 'Error',
        message: 'Internal server error',
      });
    }

    // check for new features
    const newFeatures = (availableFeatures.length > 0)
      ? features.filter(
        (e) => !availableFeatures.map((element) => element.feature_name).includes(e),
      ) : null;

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
      .catch(() => null)
      : availableFeatures.map((e) => e.id);

    if (!currentFeatures) {
      return res.status(500).send({
        remark: 'Error',
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
      .catch(() => null);
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
      pid: pID,
      contactDetails: {
        phone: result.rows[0].p_phone,
        email: result.rows[0].p_email,
      },
      location: {
        address: result.rows[0].p_address,
        lga: result.rows[0].p_lga,
        state: result.rows[0].p_state,
      },
      type: result.rows[0].t_property,
      remark: result.rows[0].s_status,
      duration: result.rows[0].r_period,
    }))
    .catch(() => null);

  if (!data.data) {
    return res.status(500).send({
      remark: 'Error',
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
      .catch(() => null);

    if (!data.data.features) {
      return res.status(500).send({
        remark: 'Error',
        message: 'Internal server error',
      });
    }
  }

  res.status(200).send({
    message: 'Property posted successfully',
    data: data.data,
  });
};
