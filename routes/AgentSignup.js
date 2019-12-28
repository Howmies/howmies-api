const express = require('express');
const AgentSignup = require('../controllers/AgentSignup');
const validate = require('../middleware/request_validator/AgentSignup');

const router = express.Router();

router.post('/signup', validate.agentSignupValidator, AgentSignup.signup);

module.exports = router;
