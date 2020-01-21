const express = require('express');
const PropertyHunt = require('../controllers/PropertyHunt');
const validate = require('../middleware/request_validator/PropertyHunt');

const router = express.Router();

router.get('/properties/:pagination', validate.propertyHuntValidator, PropertyHunt.hunt);

module.exports = router;
