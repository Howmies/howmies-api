const express = require('express');
const UserSignup = require('../controllers/UserSignup');
const validate = require('../middleware/request_validator/UserSignup');

const router = express.Router();

router.post('/signup', validate.userSignupValidator, UserSignup.signup);

module.exports = router;
