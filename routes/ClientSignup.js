const express = require('express');
const ClientSignup = require('../controllers/ClientSignup');
const validate = require('../middleware/request_validator/ClientSignup');

const router = express.Router();

router.post('/signup', validate.clientSignupValidator, ClientSignup.signup);

module.exports = router;
