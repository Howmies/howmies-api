const express = require('express');
const propertyHunt = require('../controllers/PropertySearch');
const validate = require('../middleware/request_validator/PropertySearch');

const router = express.Router();

router.get('/:pagination/', validate.propertyHuntValidator, propertyHunt);

module.exports = router;
