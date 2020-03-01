const express = require('express');
const PostImages = require('../../controllers/post_properties/PostImages');

const router = express.Router();

router.post('/properties/images', PostImages);

module.exports = router;
