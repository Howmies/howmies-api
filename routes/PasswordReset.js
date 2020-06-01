const express = require('express');
// const { passwordReset } = require('../controllers/PasswordReset');
const { forgotPassword, resetForm, updatePassword } = require('../controllers/PasswordReset');
const { email, password, url } = require('../middleware/request_validator/PasswordReset');

const router = express.Router();

// router.put('/resetpassword', passwordReset);

router.post('/forgotPassword', email, forgotPassword);
router.get('/forgotPassword/:id/:resetToken', url, resetForm);
router.post('/resetPassword/:id/:resetToken', [url, password], updatePassword);

module.exports = router;
