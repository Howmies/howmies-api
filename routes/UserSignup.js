const express = require('express');
const userSignup = require('../controllers/UserSignup');
const validate = require('../middleware/request_validator/UserSignup');

const router = express.Router();

router.post('/signup', validate, userSignup);

module.exports = router;
