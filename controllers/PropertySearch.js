const { validationResult } = require('express-validator');
const GetProperty = require('../models/properties-get-model');
const errorHandler = require('../utils/error-handler');
const successResponseHandler = require('../utils/success-response-handler');

module.exports = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { return res.status(422).send({ message: errors.array() }); }

  const { pagination } = req.params;

  const {
    location, type,
  } = req.query;

  const propertySearch = new GetProperty(pagination);

  const resolveResponse = (searchMethodPromise) => searchMethodPromise
    .then(({ rowCount, rows }) => successResponseHandler(
      res,
      rowCount === 0 ? 204 : 200,
      rowCount === 0 ? 'No property available' : 'Property available',
      rows,
    ))
    .catch(() => errorHandler(req, res));

  if (location && type) {
    const searchMethodPromise = propertySearch
      .getByLocationAndPropertyType(location, type);
    return resolveResponse(searchMethodPromise);
  }

  if (location && !type) {
    const searchMethodPromise = propertySearch
      .getByLocation(location);
    return resolveResponse(searchMethodPromise);
  }

  if (type) {
    const searchMethodPromise = propertySearch
      .getByPropertyType(type);
    return resolveResponse(searchMethodPromise);
  }
};
