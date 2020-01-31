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
    if (location && type) {
      return pool.query(
        'SELECT * from properties AS p, properties_features AS pf WHERE p.property_id=pf.property_id AND (p.state=$1 OR p.lga=$1) AND p.property_type=$2 ORDER BY p.property_id DESC OFFSET $3 LIMIT 10',
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
            const featureResult = [];
            for (let i = 0; i < features.length; i += 0) {
              featureResult.push(result.rows.filter((e) => e.feature_name === features[i]));
            }
            if (featureResult.length > 0) {
              return response.status(200).send({
                status: 'Success',
                message: 'Property is available',
                data: {
                  properties: featureResult,
                },
              });
            }
          }
          return response.status(200).send({
            status: 'Empty',
            message: 'No property available',
          });
        },
      );
    }
    if (!type && location) {
      return pool.query(
        'SELECT * from properties AS p, properties_features AS pf WHERE p.property_id=pf.property_id AND (p.state=$1 OR p.lga=$1) ORDER BY p.property_id DESC OFFSET $2 LIMIT 10',
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
            const featureResult = [];
            for (let i = 0; i < features.length; i += 0) {
              featureResult.push(result.rows.filter((e) => e.feature_name === features[i]));
            }
            if (featureResult.length > 0) {
              return response.status(200).send({
                status: 'Success',
                message: 'Property is available',
                data: {
                  properties: featureResult,
                },
              });
            }
          }
          return response.status(200).send({
            status: 'Empty',
            message: 'No property available',
          });
        },
      );
    }
    if (!location && type) {
      return pool.query(
        'SELECT * from properties AS p, properties_features AS pf WHERE p.property_id=pf.property_id AND p.property_type=$1 ORDER BY p.property_id DESC OFFSET $2 LIMIT 10',
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
            const featureResult = [];
            for (let i = 0; i < features.length; i += 0) {
              featureResult.push(result.rows.filter((e) => e.feature_name === features[i]));
            }
            if (featureResult.length > 0) {
              return response.status(200).send({
                status: 'Success',
                message: 'Property is available',
                data: {
                  properties: featureResult,
                },
              });
            }
          }
          return response.status(200).send({
            status: 'Empty',
            message: 'No property available',
          });
        },
      );
    }

    if (results.find((e) => e === 'Internal server error') === 'Internal server error') {
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
      'SELECT * from properties WHERE (state=$1 OR lga=$1) AND property_type=$2 ORDER BY property_id DESC OFFSET $3 LIMIT 10',
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
      'SELECT * from properties WHERE state=$1 OR lga=$1 ORDER BY property_id DESC OFFSET $2 LIMIT 10',
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
      'SELECT * from properties WHERE property_type=$1 ORDER BY property_id DESC OFFSET $2 LIMIT 10',
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
