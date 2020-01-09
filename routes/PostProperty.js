const express = require('express');
const { postProperty } = require('../controllers/PostProperty');
const { postPropertyValidator } = require('../middleware/request_validator/PostProperty');
const { multerUploads } = require('../middleware/file_upload/multerSetup');

const router = express.Router();

router.post('/properties', [postPropertyValidator, multerUploads], postProperty);

module.exports = router;
