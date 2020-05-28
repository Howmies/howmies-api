const { validationResult } = require('express-validator');

module.exports = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { return res.status(422).send({ message: errors.array() }); }

  res
    .status(200)
    .clearCookie('HURT', { path: '/api/v0.0.1/auth/refresh_token' })
    .removeHeader('Authorization');
  return res.send({ message: 'Logged Out, Successfully' });
};
