const { validationResult } = require('express-validator');
const BasicPropertySearch = require('../middleware/PropertySeacrh/PropertySearch');
const PropertySearchWithFeatures = require('../middleware/PropertySeacrh/PropertySearchWithFeatures');

module.exports = async (req, response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { return response.status(422).send({ message: errors.array() }); }

  const { pagination } = req.params;

  const {
    location, type, features,
  } = req.query;

  if (features) {
    const propertySearchWithFeatures = new PropertySearchWithFeatures(
      response, pagination, features,
    );

    if (location && type) {
      return propertySearchWithFeatures.byLocationAndPropertyType(location, type);
    }

    if (location) {
      return propertySearchWithFeatures.byLocation(location);
    }

    if (type) {
      return propertySearchWithFeatures.byPropertyType(type);
    }
  } else {
    const basicPropertySearch = new BasicPropertySearch(response, pagination);

    if (location && type) {
      return basicPropertySearch.byLocationAndPropertyType(location, type);
    }

    if (location) {
      return basicPropertySearch.byLocation(location);
    }

    if (type) {
      return basicPropertySearch.byPropertyType(type);
    }
  }
};
