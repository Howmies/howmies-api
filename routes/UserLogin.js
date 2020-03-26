const express = require('express');
const userLogin = require('../controllers/UserLogin');
const validate = require('../middleware/request_validator/UserLogin');

const router = express.Router();

router.post('/login', validate, userLogin);

module.exports = router;
