const express = require('express');
const { signup } = require('../controllers/UserSignup');
const { userSignupValidator } = require('../middleware/request_validator/UserSignup');

const router = express.Router();

router.post('/auth/signup', userSignupValidator, signup);

module.exports = router;
