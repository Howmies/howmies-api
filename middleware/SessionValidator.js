const jwt = require('jsonwebtoken');

module.exports = (accessToken, privateSecret) => jwt.verify(
  accessToken,
  privateSecret,
  { algorithms: ['HS256'], ignoreExpiration: true },
  (err, result) => {
    if (err) {
      return { error: 'Invalid session access' };
    }

    // check for token expiration
    const expiration = Math.floor(result.exp - Date.now() / 1000);

    if (expiration < 0) {
      return { expiration };
    }

    if (result && result.uid && result.role) {
      switch (result.role) {
        case 'user':
          return { user: result };
        case 'admin':
          return { admin: result };
        default:
          break;
      }
    }
  },
);
