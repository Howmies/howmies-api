const express = require('express');
const userSignout = require('../controllers/UserSignout');
const validate = require('../middleware/request_validator/UserSignout');

const router = express.Router();

router.delete('/signout/', validate, userSignout);

module.exports = router;
