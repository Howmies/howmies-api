const express = require('express');
const { body, sanitizeBody } = require('express-validator');
const AgentSignup = require('../Controllers/AgentSignupController');

const router = express.Router();

router.post('/signup', [
  sanitizeBody('agentName').escape(),
  sanitizeBody('address').escape(),
  sanitizeBody('lga').escape(),
  sanitizeBody('state').escape(),
  body('email').isEmail().normalizeEmail({ all_lowercase: true }),
  body('officeNumber').isLength({ max: 14, min: 11 }).escape(),
  body('mobileNumber').isLength({ max: 14, min: 11 }).escape().optional({ nullable: true }),
  body('password')
    .isLength({ max: 24, min: 8 })
    .withMessage('password range from 8 to 16'),
], AgentSignup);

module.exports = router;
