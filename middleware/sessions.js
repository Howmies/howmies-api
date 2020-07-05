const sessionValidator = require('../utils/session-validator');
const errorHandler = require('../utils/error-handler');

module.exports = () => async (req, res, next) => {
  try {
    const uid = await sessionValidator(
      req.headers.authorization,
      process.env.RSA_PRIVATE_KEY,
      'user',
    );
    req.params.uid = uid;
    next();
  } catch (error) {
    return errorHandler(req, res, 403);
  }
};
