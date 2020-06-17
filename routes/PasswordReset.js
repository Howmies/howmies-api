const express = require('express');
const { forgotPassword, resetForm, updatePassword } = require('../controllers/PasswordReset');
const { email, password, url } = require('../middleware/request_validator/PasswordReset');

const router = express.Router();

router
  .post('/forgot_password/', email, forgotPassword)
  .get('/forgot_password/:resetToken/', url, resetForm)
  .post('/reset_password/:resetToken/', [url, password], updatePassword);

module.exports = router;
