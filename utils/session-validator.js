const jwt = require('jsonwebtoken');

/**
 * Verify the user's authenticity
 * @param {String} token The user's token.
 * The token can be derived from the header, cookie or url.
 * @param {String} secret The secret key that was used to sign the expected token.
 * @param {String} audience The type of expected user.
 */
module.exports = async (token, secret, audience) => jwt.verify(
  token,
  secret,
  {
    algorithms: ['HS256'],
    audience,
    issuer: 'Howmies Entreprise',
  },
  (err, result) => {
    if (err) {
      return Promise.reject(err);
    }
    switch (result.aud) {
      case 'user':
        /**
           * @type {Number} The user ID
           */
        return Promise.resolve(result.uid);

      case 'admin':
        /**
           * @type {Number} The admin ID
           */
        return Promise.resolve(result.uid);

      default:
        break;
    }
  },
);
