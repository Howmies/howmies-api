const express = require('express');
const getImages = require('../../controllers/post_properties/GetPropretyImages');

const router = express.Router();

router.get('/properties/images', getImages);

module.exports = router;
