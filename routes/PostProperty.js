const express = require('express');
const { postProperty } = require('../controllers/PostProperty');
const { postPropertyValidator } = require('../middleware/request_validator/PostProperty');
const { imageUploads } = require('../middleware/file_upload/multerSetup');

const router = express.Router();

router.post('/properties', [postPropertyValidator, imageUploads], postProperty);

module.exports = router;
