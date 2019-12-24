const express = require('express');
const OwnerSignup = require('../controllers/OwnerSignup');
const validate = require('../middleware/validate/validate');

const router = express.Router();

router.post('/signup', validate.ownerRequestValidator, OwnerSignup.signup);

module.exports = router;
