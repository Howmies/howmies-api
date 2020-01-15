const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const path = require('path');
const pool = require('../middleware/database/elephantsqlConfig');
const { multerUploads } = require('../middleware/file_upload/multerSetup');
const { cloudinaryConfig, uploader } = require('../middleware/file_upload/cloudinaryConfig');

dotenv.config();

if (dotenv.config().error) throw dotenv.config().error;

cloudinaryConfig();

exports.postProperty = async (req, response) => {
  // verify user
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

  // verify user input
  const errors = validationResult(req);
  if (!errors.isEmpty()) { return response.status(422).send({ message: errors.array() }); }

  // verify successfully read image
  multerUploads(req, response, (err) => {
    if (req.imagesError) console.log(req.imagesError);
    if (err) console.log(err);
  });

  if (!req.files) {
    return response.status(403).send({
      status: 'Error',
      message: 'Ensure your images are jpg, jpeg or png',
    });
  }

  // get user input
  const {
    type, state, lga, address, price, period, description, features,
  } = req.body;

  // verify property type entry
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

  // verify period entry
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

  // save property images
  const addImage = (imageURL, propertyID) => pool.query(
    'INSERT INTO images(image_url, property_id) VALUES($1, $2)',
    [imageURL, propertyID],
  )
    .catch((err) => console.log(err));

  const toCloudinary = (image, propertyID) => uploader.upload(image, {
    folder: 'Howmies/Properties',
    format: 'jpg',
  })
    .then((result) => addImage(result.url, propertyID))
    .catch((err) => console.log(err));

  // save property features
  const joinPropertyFeature = (featureElement, propertyID) => pool.query(
    'INSERT INTO properties_features(feature_name, property_id) VALUES($1, $2)',
    [featureElement, propertyID],
  )
    .catch((err) => console.log(err));

  const addFeature = (featureElement, propertyID) => pool.query(
    'INSERT INTO features(feature_name) VALUES($1) RETURNING feature_name',
    [featureElement],
  )
    .then((result) => joinPropertyFeature(result.rows[0].feature_name, propertyID))
    .catch((err) => console.log(err));

  // send property details to clients
  const viewPost = (propertyID) => pool.query(
    'SELECT i.image_url, p.price, p.property_period, p.property_type, p.state, p.lga, p.address, p.property_description, pf.feature_name FROM properties AS p, images AS i, properties_features AS pf WHERE property_id=$1',
    [propertyID],
  )
    .then((result) => response.status(200).send({
      message: 'Property posted successfully',
      data: {
        imageURL: [].push(result.rows.forEach((e) => e.image_url)),
        price: result.rows[0].price,
        period: result.rows[0].property_period,
        type: result.rows[0].property_type,
        state: result.rows[0].state,
        lga: result.rows[0].lga,
        address: result.rows[0].address,
        description: result.rows[0].property_description,
        features: [].push(result.rows.forEach((e) => e.feature_name)),
      },
    }))
    .catch((err) => console.log(err));

  // save other property details to properties table
  await pool.query(
    'INSERT INTO properties(owner_id,  property_type, state, lga, address, property_description, price, property_period, post_date) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING property_id',
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
  )
    .then((result) => {
      for (let i = 0; i < req.files.length; i += 1) {
        toCloudinary(path.resolve(__dirname, req.files[i]), result.rows[0].property_id);
      }

      if (features && features.length > 0) {
        for (let i = 0; i < features.length; i += 1) {
          addFeature(features[i], result.rows[0].property_id);
        }
      }

      viewPost(result.rows[0].property_id);
    })
    .catch((err) => response.status(500).send({
      status: err.name,
      message: err.message,
    }));
};
