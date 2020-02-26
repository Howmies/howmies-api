const express = require('express');
const postPropertyValidator = require('../middleware/request_validator/PostProperty');
const postProperty = require('../controllers/PostProperty');
const postFeatures = require('../controllers/PostFeatures');
const getProperty = require('../controllers/GetProperty');

const router = express.Router();

router.post('/properties', postPropertyValidator, postProperty, postFeatures, getProperty);

module.exports = router;
