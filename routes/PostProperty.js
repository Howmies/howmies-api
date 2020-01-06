const express = require('express');
const PostProperty = require('../controllers/PostProperty');
const validate = require('../middleware/request_validator/PostProperty');

const router = express.Router();

router.post('/auth/login', validate.postPropertyValidator, PostProperty.postProperty);

module.exports = router;
