const express = require('express');
const UserLogin = require('../controllers/UserLogin');
const validate = require('../middleware/request_validator/UserLogin');

const router = express.Router();

router.post('/auth/login', validate.userLoginValidator, UserLogin.login);

module.exports = router;
