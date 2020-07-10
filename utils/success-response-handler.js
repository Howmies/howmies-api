/**
 * @description A function that facilitates the response of a successful request
 * @param {Response} res http response object
 * @param {Number} status http success status
 * @param {String} message custom success message
 * @param {Object} data custom success message
 * @returns {Response} http response with success status and message
 */

module.exports = (res, status, message, data) => {
  const resBody = { message, data };

  if (message == null) {
    delete resBody.message;
  }

  return res.status(status).send(resBody);
};
