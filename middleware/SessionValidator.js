const jwt = require('jsonwebtoken');

module.exports = class {
  /**
   * Verify the user's authenticity
   * @param {String} token The user's token.
   * The token can be derived from the header, cookie or url.
   * @param {String} secret The secret key that was used to sign the expected token.
   * @param {String} audience The type of expected user.
   */
  constructor(token, secret, audience) {
    jwt.verify(
      token,
      secret,
      {
        algorithms: ['HS256'],
        audience,
        issuer: 'Howmies Entreprise',
      },
      (err, result) => {
        if (err) {
          this.error = 'Invalid session access';
        }

        if (result && result.uid && result.aud) {
          switch (result.aud) {
            case 'user':
              /**
               * @type {Number} The user ID
               */
              this.user = result.uid;
              break;
            case 'admin':
              /**
               * @type {Number} The admin ID
               */
              this.admin = result.uid;
              break;
            default:
              break;
          }
        }
      },
    );
  }

  /**
   * Verify the user's authenticity
   * @param {Response} res Express HTTP response method.
   * @returns {Response} Standard HTTP response.
   */
  errorResponse(res) {
    return res.status(403).send({
      remark: 'Error',
      message: this.error,
    });
  }
};
