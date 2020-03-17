const express = require('express');
const refreshToken = require('../controllers/RefreshToken');
const validate = require('../middleware/request_validator/RefreshToken');

const router = express.Router();

router.post('/refresh_token', validate, refreshToken);

module.exports = router;
