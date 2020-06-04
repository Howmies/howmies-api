const express = require('express');
// const { passwordReset } = require('../controllers/PasswordReset');
const { forgotPassword, resetForm, updatePassword } = require('../controllers/PasswordReset');
const { email, password, url } = require('../middleware/request_validator/PasswordReset');

const router = express.Router();

// router.put('/resetpassword', passwordReset);

router.post('/forgot_password/', email, forgotPassword);
router.get('/forgot_password/:resetToken/', url, resetForm);
router.post('/reset_password/:resetToken/', [url, password], updatePassword);

module.exports = router;
