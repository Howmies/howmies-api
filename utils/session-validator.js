const jwt = require('jsonwebtoken');

/**
 * @description Verify the user's authenticity.
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
    audience: audience === 'user' || audience === 'admin'
      ? audience : null,
    issuer: 'Howmies Entreprise',
  },
  (err, result) => {
    if (err) {
      return Promise.reject(err);
    }
    switch (result.aud) {
      case 'user':
        return Promise.resolve(result.uid);

      case 'admin':
        return Promise.resolve(result.uid);

      default:
        return Promise.reject(new Error({ message: 'Privileged user not found' }));
    }
  },
);
