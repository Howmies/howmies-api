const express = require('express');
const AgentSignup = require('../controllers/AgentSignup');
const validate = require('../middleware/validate/validate');

const router = express.Router();

router.post('/signup', validate.agentRequestValidator, AgentSignup.signup);

module.exports = router;
