const { validationResult } = require('express-validator');
const GetProperty = require('../models/properties-get-model');
const errorHandler = require('../utils/error-handler');
const successResponseHandler = require('../utils/success-response-handler');

module.exports = async (req, response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { return response.status(422).send({ message: errors.array() }); }

  const { pagination } = req.params;

  const {
    location, type,
  } = req.query;

  const propertySearch = new GetProperty(pagination);

  if (location && type) {
    try {
      const { rowCount, rows } = await propertySearch.getByLocationAndPropertyType(location, type);
      return successResponseHandler(
        response,
        rowCount === 0 ? 204 : 200,
        rowCount === 0 ? 'No property available' : 'Property available',
        rows,
      );
    } catch (error) {
      return errorHandler(req, response);
    }
  }

  if (location && !type) {
    try {
      const { rowCount, rows } = await propertySearch.getByLocation(location, type);
      return successResponseHandler(
        response,
        rowCount === 0 ? 204 : 200,
        rowCount === 0 ? 'No property available' : 'Property available',
        rows,
      );
    } catch (error) {
      return errorHandler(req, response);
    }
  }

  if (type) {
    try {
      const { rowCount, rows } = await propertySearch.getByPropertyType(location, type);
      return successResponseHandler(
        response,
        rowCount === 0 ? 204 : 200,
        rowCount === 0 ? 'No property available' : 'Property available',
        rows,
      );
    } catch (error) {
      return errorHandler(req, response);
    }
  }
};
