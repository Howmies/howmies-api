const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const pool = require('../middleware/database/elephantsqlConfig');
const { cloudinaryConfig, uploader } = require('../middleware/file_upload/cloudinaryConfig');

dotenv.config();

if (dotenv.config().error) throw dotenv.config().error;

cloudinaryConfig();

exports.postProperty = async (req, response) => {
  const { uid } = jwt.decode(req.headers.authorization);
  if (!uid) {
    return response.status(403).send({
      status: 'Error',
      message: 'Invalid session access',
    });
  }

  const ownerID = await pool.query('SELECT user_id FROM users WHERE user_id=$1', [uid])
    .then((result) => result.rows[0].user_id)
    .catch((err) => console.log(err));
  console.log(`ownerID: ${ownerID}`);
  if (!ownerID) {
    return response.status(403).send({
      status: 'Error',
      message: 'User not found',
    });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) { return response.status(422).send({ message: errors.array() }); }

  const { imageValidationError } = req;
  if (imageValidationError) {
    return response.status(422).send({
      status: imageValidationError.name,
      message: imageValidationError.message,
    });
  }

  const {
    type, state, lga, address, price, period, images, description, features,
  } = req.body;

  if (!images) {
    return response.status(400).send({
      status: 'Error',
      message: 'Input at least an image in png or jpg format',
    });
  }

  const propertyType = await pool.query('SELECT property_type_name FROM property_types WHERE property_type_name=$1',
    [type.toLowerCase()])
    .then((result) => result.rows[0].property_type_name)
    .catch((err) => console.log(err));
  console.log(`propertyType: ${propertyType}`);
  if (!propertyType) {
    return response.status(403).send({
      status: 'Error',
      message: 'Invalid property type',
    });
  }

  const perPeriod = await pool.query('SELECT period_name FROM property_period WHERE period_name=$1',
    [period.toLowerCase()])
    .then((result) => result.rows[0].period_name)
    .catch((err) => console.log(err));
  console.log(`perPeriod: ${perPeriod}`);
  if (!perPeriod) {
    return response.status(403).send({
      status: 'Error',
      message: 'Invalid renewal period',
    });
  }

  const addImage = (imageURL, propertyID) => pool.query('INSERT INTO images(image_url, property_id) VALUES($1, $2)',
    [imageURL, propertyID],
    (err) => {
      if (err) {
        return response.status(500).send({
          status: err.name,
          message: err.message,
        });
      }
    });

  const toCloudinary = (image, propertyID) => {
    uploader.upload(image, {
      folder: 'Howmies/Properties',
      format: 'jpg',
    }, (err, result) => {
      if (err) {
        return response.status(406).send({
          status: err.name,
          message: err.message,
        });
      }
      addImage(result.url, propertyID);
    });
  };

  const joinPropertyFeature = (featureElement, propertyID) => pool.query('INSERT INTO properties_features(feature_name, property_id) VALUES($1, $2)',
    [featureElement, propertyID],
    (err) => {
      if (err) {
        return response.status(500).send({
          status: err.name,
          message: err.message,
          data: {},
        });
      }
    });

  const addFeature = (featureElement, propertyID) => pool.query('INSERT INTO features(feature_name) VALUES($1) RETURNING feature_name',
    [featureElement],
    (err, result) => {
      if (err || !result.rows || (result.rows && result.rows.length < 1)) {
        return response.status(500).send({
          status: err.name,
          message: err.message,
        });
      }

      joinPropertyFeature(result.rows[0].feature_name, propertyID);
    });

  const viewPost = (propertyID) => pool.query('SELECT i.image_url, p.price, p.property_period, p.property_type, p.state, p.lga, p.address, p.property_description, pf.feature_name FROM properties AS p, images AS i, properties_features AS pf WHERE property_id=$1',
    [propertyID],
    (err, result) => {
      if (err || !result.rows || (result.rows && result.rows.length < 1)) {
        return response.status(500).send({
          status: err.name,
          message: err.message,
        });
      }

      return response.status(200).send({
        message: 'Property posted successfully',
        data: {
          imageURL: result.rows.forEach((e) => e.image_url),
          price: result.rows[0].price,
          period: result.rows[0].property_period,
          type: result.rows[0].property_type,
          state: result.rows[0].state,
          lga: result.rows[0].lga,
          address: result.rows[0].address,
          description: result.rows[0].property_description,
          features: result.rows.forEach((e) => e.feature_name),
        },
      });
    });

  pool.query('INSERT INTO properties(owner_id,  property_type, state, lga, address, property_description, price, property_period, post_date) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING property_id',
    [
      ownerID,
      propertyType,
      state,
      lga,
      address,
      description,
      price,
      perPeriod,
      (new Date()).toUTCString(),
    ],
    (err, result) => {
      if (err) {
        return response.status(500).send({
          status: err.name,
          message: err.message,
        });
      }
      console.log(`Properties Table: ${result.rows[0].property_id}`);
      return response.send({ status: 'debugging', message: 'Checking for point of error' });

      for (let i = 0; i < images.length; i + 1) {
        toCloudinary(images[i], result.rows[0].property_id);
      }

      if (features && features.length > 0) {
        for (let i = 0; i < features.length; i + 1) {
          addFeature(features[i], result.rows[0].property_id);
        }
      }

      viewPost(result.rows[0].property_id);
    });
};
