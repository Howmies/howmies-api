const pool = require('../middleware/configs/elephantsql');

module.exports = (req, res) => {
  const token = req.cookies.HURT;
  if (!token) return res.status(401).send('Access denied. No token provided');

  pool
    .query('DELETE FROM logged_users WHERE refresh_token=$1', [token])
    .then(() => res
      .status(200)
      .clearCookie('HURT', { path: '/api/v0.0.1/auth/refresh_token' })
      .removeHeader('Authorization')
      .send('Logged Out, Successfully'))
    .catch(() => res.status(500).send({ error: 'Internal Server Error. Try again' }));
};
