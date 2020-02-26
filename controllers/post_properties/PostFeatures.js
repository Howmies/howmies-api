const dotenv = require('dotenv');
const pool = require('../../elephantsql');

dotenv.config();

module.exports = async (req, res, next) => {
  // get features and property ID
  const { propertyID, features } = res.locals;

  if (!features) {
    return next();
  }

  if (!propertyID) {
    console.log('Property ID not found');
    return res.status(500).send({
      status: 'Error',
      message: 'Internal server error',
    });
  }
  // verify property type
  const newFeatures = [];
  const featureIDs = [];
  const featureVerErr = [];

  features.forEach((feature) => {
    pool.query(
      'INSERT INTO property_features(property_feature_name) VALUE($1) RETURNING property_feature_id',
      [feature.toLowerCase()],
    )
      .then((result) => {
        // collect the new features
        newFeatures.push(result.rows[0].property_feature_name);

        // garner the id of the all features (new)
        featureIDs.push(result.rows[0].property_feature_id);
      })
      .catch((err) => {
        if (err.message.includes('unique')) {
          // garner the id of the all features (existing)
          pool.query(
            'SELECT property_feature_id FROM property_features WHERE property_feature_name=$1',
            [feature.toLowerCase()],
            (error, result) => {
              if (error) {
                console.log(error);
              } else {
                featureIDs.push(result.rows[0].property_feature_id);
              }
            },
          );
        } else {
          console.log(err);
          featureVerErr.push('Internal server error');
        }
      });
  });

  if (featureVerErr.length > 0) {
    // clear feature verification errors array for reuse
    for (let i = 0; i < featureVerErr.length; i += 1) {
      featureVerErr.pop();
    }

    return res.status(500).send({
      status: 'Error',
      message: 'Internal server error',
    });
  }

  // fill property/feature many-to-many table
  featureIDs.forEach((featureID) => {
    pool.query(
      'INSERT INTO properties_features(property_id, property_feature_id) VALUE($1, $2)',
      [propertyID, featureID],
    )
      .catch((err) => {
        console.log(err);
        featureVerErr.push('Internal server error');
      });
  });

  if (featureVerErr.length > 0) {
    return res.status(500).send({
      status: 'Error',
      message: 'Internal server error',
    });
  }

  next();
};
