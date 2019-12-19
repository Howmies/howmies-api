const express = require('express');
const { body, sanitizeBody } = require('express-validator');
const AgentSignup = require('../controllers/AgentSignup');

const router = express.Router();

const expressValidatorMiddleware = [
  sanitizeBody('agentName').escape(),
  sanitizeBody('address').escape(),
  sanitizeBody('lga').escape(),
  sanitizeBody('state').escape(),
  body('email').isEmail().normalizeEmail({ all_lowercase: true }),
  body('officeNumber').isLength({ max: 14, min: 11 }).escape(),
  body('mobileNumber').isLength({ max: 14, min: 11 }).escape().optional({ nullable: true }),
  body('password')
    .isLength({ max: 24, min: 8 })
    .withMessage('Password must be between 8 - 24 characters'),
];

router.post('/signup', expressValidatorMiddleware, AgentSignup.signup);

module.exports = router;
