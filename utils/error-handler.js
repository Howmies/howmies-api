/**
 * @description Returns an error response
 * @param {Request} req http request object
 * @param {Response} res http response object
 * @param {Number} status http error status
 * @param {String} message custom error message
 * @returns {Response} http response with error status and message
 */

module.exports = (req, res, status = 500, message) => {
  let errMessage;
  if (message == null) {
    switch (status) {
      case 400:
        errMessage = 'Internal server error';
        break;
      case 401:
        errMessage = `Ensure you are logged in, or signup at ${req.hostname}/api/v.0.0.1/auth/users/signup`;
        break;
      case 403:
        errMessage = 'Invalid user access';
        break;
      case 422:
        errMessage = 'Invalid user input';
        break;
      default:
        errMessage = 'Internal server error';
        break;
    }
  } else {
    errMessage = message;
  }
  return res.status(status).send({ message: errMessage });
};
