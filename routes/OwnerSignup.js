const express = require('express');
const OwnerSignup = require('../controllers/OwnerSignup');

const router = express.Router();

router.post('/signup', OwnerSignup.requestValidator, OwnerSignup.signup);

module.exports = router;
