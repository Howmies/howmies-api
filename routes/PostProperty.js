const express = require('express');
const postPropertyValidator = require('../middleware/request_validator/PostProperty');
const postProperty = require('../controllers/PostProperty');

const router = express.Router();

router.post('/', postPropertyValidator, postProperty);

module.exports = router;
