const { validationResult } = require('express-validator');
const errorHandler = require('../utils/error-handler');

module.exports = async (req, res, next) => {
  // verify property details by user
  const errors = validationResult(req);
  if (!errors.isEmpty()) return errorHandler(req, res, 403, errors.array());
  return next();
};
