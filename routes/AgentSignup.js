const express = require('express');
const AgentSignup = require('../controllers/AgentSignup');

const router = express.Router();

router.post('/signup', AgentSignup.requestValidator, AgentSignup.signup);

module.exports = router;
