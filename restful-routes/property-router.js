const express = require('express');

const propertyRouter = express.Router();

const authPropertyRouter = express.Router();

// property search
propertyRouter.route('/Properties')
  .get((req, res) => {
    if (req.query.location) {
      return res
        .status(200)
        .json({ data: 'properties and images data' });
    }
    if (req.query.type) {
      return res
        .status(200)
        .json({ data: 'properties and images data' });
    }
    if (req.query.propertyRating) {
      return res
        .status(200)
        .json({ data: 'images and properties data' });
    }
    if (req.query.location && req.query.type) {
      return res
        .status(200)
        .json({ data: 'properties and images data' });
    }
    if (req.query.location && req.query.propertyRating) {
      return res
        .status(200)
        .json({ data: 'properties and images data' });
    }
    if (req.query.type && req.query.propertyRating) {
      return res
        .status(200)
        .json({ data: 'properties and images data' });
    }
    if (req.query.type && req.query.type && req.query.propertyRating) {
      return res
        .status(200)
        .json({ data: 'properties and images data' });
    }
  });

// property profile check
propertyRouter.route('/Properties/:propertyId')
  .get((req, res) => {
    if (req.params.propertyId) {
      return res
        .status(200)
        .json({ data: 'property and images data' });
    }
  });

// property access by authorized property
authPropertyRouter.route('/Properties/:propertyId')
  .get((req, res) => {
    if (req.headers.authorization) {
      return res
        .status(200)
        .json({ data: 'property data' });
    }
  })
  .post((req, res) => {
    if (req.params.propertyId) {
      return res
        .status(200)
        .json({ data: 'new property\'s id' });
    }
  })
  .patch((req, res) => {
    if (req.headers.authorization) {
      return res
        .status(200)
        .json({ data: 'property data' });
    }
  })
  .delete((req, res) => {
    if (req.headers.authorization) {
      return res
        .status(200)
        .json({ data: 'property data' });
    }
  });

module.exports = { propertyRouter, authPropertyRouter };
