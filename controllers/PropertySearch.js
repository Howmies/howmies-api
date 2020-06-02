const { validationResult } = require('express-validator');
const BasicPropertySearch = require('../middleware/PropertySearch');

module.exports = async (req, response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { return response.status(422).send({ message: errors.array() }); }

  const { pagination } = req.params;

  const {
    location, type,
  } = req.query;

  const basicPropertySearch = new BasicPropertySearch(response, pagination);

  if (location && type) {
    return basicPropertySearch.byLocationAndPropertyType(location, type);
  }

  if (location && !type) {
    return basicPropertySearch.byLocation(location);
  }

  if (type) {
    return basicPropertySearch.byPropertyType(type);
  }
};
