const express = require('express');
const OwnerSignup = require('../controllers/OwnerSignup');
const validate = require('../middleware/request_validator/OwnerSignup');

const router = express.Router();

router.post('/signup', validate.ownerSignupValidator, OwnerSignup.signup);

module.exports = router;
