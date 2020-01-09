const express = require('express');
const { login } = require('../controllers/UserLogin');
const { userLoginValidator } = require('../middleware/request_validator/UserLogin');

const router = express.Router();

router.post('/auth/login', userLoginValidator, login);

module.exports = router;
