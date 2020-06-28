const express = require('express');
const { multerUpload } = require('../middleware/file_upload/multerConfig');
const postImagesValidator = require('../middleware/request_validator/post-images-validator');
const postImages = require('../controllers/PostImages');

const router = express.Router();

router.post('/:property_id/images', [postImagesValidator, multerUpload], postImages);

module.exports = router;
