const dotenv = require('dotenv');
const pool = require('../../elephantsql');

dotenv.config();

module.exports = async (req, res) => {
  const data = {};

  // get features and property ID
  const { propertyID } = res.locals;

  // retrieve property details for response
  await pool.query(
    `SELECT
      p.address, p.lga, p.state, p.price, p.phone, p.email,
      t.property_type_name, s.status_type_name, r.status_period_name
    FROM
      properties AS p,
      property_types AS t,
      status_types AS s,
      status_periods AS r,
      property_features AS f,
      properties_features AS pf
    WHERE
      p.property_id=$1
      && t.property_type_id=p.property_type_id
      && s.status_type_id=p.status_type_id
      && r.status_period_id=p.status_period_id;`,
    [propertyID],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send({
          status: 'Error',
          message: 'Internal server error',
        });
      }

      data.contactDetails = {
        phone: result.rows[0],
        email: result.rows[0],
      };

      data.location = {
        addr: result.rows[0],
        lga: result.rows[0],
        state: result.rows[0],
      };

      data.propertyType = result.rows[0].t.propertyType_name;
      data.statusType = result.rows[0].s.statusType_name;
    },
  );

  // retrieve features for response if such features exist
  await pool.query(
    `SELECT
      f.property_features_name
    FROM
      property_features AS f,
      properties_features AS pf
    WHERE
      pf.property_id=$1
      && f.property_features_id=pf.property_features_id;`,
    [propertyID],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send({
          status: 'Error',
          message: 'Internal server error',
        });
      }

      if (result.rows && result.rows.length > 0) {
        data.features = result.rows;
      }
    },
  );

  res.status(200).send({
    message: 'Property posted successfully',
    data,
  });
};
