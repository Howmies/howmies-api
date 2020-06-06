const express = require('express');
const { forgotPassword, resetForm, updatePassword } = require('../controllers/PasswordReset');
const { email, password, url } = require('../middleware/request_validator/PasswordReset');

const router = express.Router();

router.post('/forgot_password/', email, forgotPassword);
router.get('/forgot_password/:resetToken/', url, resetForm);
router.put('/reset_password/:resetToken/', [url, password], updatePassword);

module.exports = router;
