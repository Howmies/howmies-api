const express = require('express');
const { multerUpload } = require('../middleware/file_upload/multerConfig');
const { postImages } = require('../controllers/PostImages');

const router = express.Router();

router.post('/properties/:pid/images', multerUpload, postImages);

module.exports = router;
