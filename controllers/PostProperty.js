const dotenv = require('dotenv');
const { validationResult } = require('express-validator');
const PropertiesModel = require('../models/properties-model');
const FeaturesModel = require('../models/features-model');
const PropertyAndFeaturesModel = require('../models/properties-and-features-model');
const sessionValidator = require('../utils/session-validator');
const errorHandler = require('../utils/error-handler');

dotenv.config();

module.exports = async (req, res) => {
  // verify session
  let uid;

  try {
    uid = await sessionValidator(
      req.headers.authorization,
      process.env.RSA_PRIVATE_KEY,
      'user',
    );
  } catch (error) {
    return errorHandler(req, res, 403);
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

  // save property details to properties table except features
  const propertiesModel = new PropertiesModel(uid);

  let pID;

  try {
    const newPropertyId = await propertiesModel.create(
      type, state, lga, address, status, price, period, description, phone, email,
    );

    if (newPropertyId == null) {
      return errorHandler(
        req, res, 400, 'Ensure "status", "period" and "type"',
      );
    }

    pID = newPropertyId;
  } catch (err) {
    return errorHandler(req, res);
  }

  let featureIds;

  // handle property features request

  if (features) {
    try {
      await FeaturesModel.create(features);
    } catch (err) {
      return errorHandler(req, res);
    }

    try {
      const requiredFeatures = await FeaturesModel.getForManyByName(features);
      featureIds = requiredFeatures.map((e) => e.id);
    } catch (err) {
      return errorHandler(req, res);
    }

    // fill the property-features relationship

    try {
      await PropertyAndFeaturesModel.create(featureIds, pID);
    } catch (err) {
      return errorHandler(req, res);
    }
  }

  // respond property ID to user request

  res.status(201).send({
    message: 'Property posted successfully',
    data: {
      propertyId: pID,
    },
  });
};
