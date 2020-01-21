const { validationResult } = require('express-validator');
const pool = require('../elephantsql');

exports.hunt = async (req, response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { return response.status(422).send({ message: errors.array() }); }

  const { pagination } = req.params;

  const {
    location, type, features,
  } = req.query;

  if (features && features.length > 0) {
    const results = [];
    results.push(
      features.forEach(async (feature) => {
        if (location && type) {
          await pool.query(
            'SELECT * from properties AS p, properties_features AS pf WHERE p.property_id=pf.property_id AND (p.state=$1 OR p.lga=$1) AND p.property_type=$2 AND pf.feature_name=$3 ORDER BY post_date DESC OFFSET $4 LIMIT 10',
            [location, type, feature, pagination],
            (err, result) => {
              if (err) {
                console.log({
                  status: err.name,
                  message: err.message,
                });
                return 'Internal server error';
              }
              if (result.rows.length > 0) {
                return result.rows.forEach((e) => e);
              }
            },
          );
        } else if (!type && location) {
          await pool.query(
            'SELECT * from properties AS p, properties_features AS pf WHERE p.property_id=pf.property_id AND (p.state=$1 OR p.lga=$1) AND pf.feature_name=$2 ORDER BY post_date DESC OFFSET $3 LIMIT 10',
            [location, feature, pagination],
            (err, result) => {
              if (err) {
                console.log({
                  status: err.name,
                  message: err.message,
                });
                return 'Internal server error';
              }
              if (result.rows.length > 0) {
                return result.rows.forEach((e) => e);
              }
            },
          );
        } else if (!location && type) {
          await pool.query(
            'SELECT * from properties AS p, properties_features AS pf WHERE p.property_id=pf.property_id AND p.property_type=$1 AND pf.feature_name=$2 ORDER BY post_date DESC OFFSET $3 LIMIT 10',
            [type, feature, pagination],
            (err, result) => {
              if (err) {
                console.log({
                  status: err.name,
                  message: err.message,
                });
                return 'Internal server error';
              }
              if (result.rows.length > 0) {
                return result.rows.forEach((e) => e);
              }
            },
          );
        }
      }),
    );

    if (results.includes('Internal server error')) {
      return response.status(500).send({
        status: 'Error',
        message: 'Internal server error',
      });
    }
    if (!!(results.find((e) => e === null)) && results.length > 0) {
      return response.status(200).send({
        status: 'Success',
        message: 'Property is available',
        data: {
          properties: results,
        },
      });
    }
    return response.status(200).send({
      status: 'Empty',
      message: 'No property available',
    });
  }

  if (location && type) {
    pool.query(
      'SELECT * from properties WHERE (state=$1 OR lga=$1) AND property_type=$2 ORDER BY post_date DESC OFFSET $3 LIMIT 10',
      [location, type, pagination],
      (err, result) => {
        if (err) {
          console.log({
            status: err.name,
            message: err.message,
          });
          return response.status(500).send({
            status: 'Error',
            message: 'Internal server error',
          });
        }
        if (result.rows.length > 0) {
          return response.status(200).send({
            status: 'Success',
            message: 'Property is available',
            data: {
              properties: result.rows,
            },
          });
        }
        return response.status(200).send({
          status: 'Empty',
          message: 'No property available',
        });
      },
    );
  } else if (!type && location) {
    pool.query(
      'SELECT * from properties WHERE state=$1 OR lga=$1 ORDER BY post_date DESC OFFSET $2 LIMIT 10',
      [location, pagination],
      (err, result) => {
        if (err) {
          console.log({
            status: err.name,
            message: err.message,
          });
          return response.status(500).send({
            status: 'Error',
            message: 'Internal server error',
          });
        }
        if (result.rows.length > 0) {
          return response.status(200).send({
            status: 'Success',
            message: 'Property is available',
            data: {
              properties: result.rows,
            },
          });
        }
        return response.status(200).send({
          status: 'Empty',
          message: 'No property available',
        });
      },
    );
  } else if (!location && type) {
    pool.query(
      'SELECT * from properties WHERE property_type=$1 ORDER BY post_date DESC OFFSET $2 LIMIT 10',
      [type, pagination],
      (err, result) => {
        if (err) {
          console.log({
            status: err.name,
            message: err.message,
          });
          return response.status(500).send({
            status: 'Error',
            message: 'Internal server error',
          });
        }
        if (result.rows.length > 0) {
          return response.status(200).send({
            status: 'Success',
            message: 'Property is available',
            data: {
              properties: result.rows,
            },
          });
        }
        return response.status(200).send({
          status: 'Empty',
          message: 'No property available',
        });
      },
    );
  }
};
