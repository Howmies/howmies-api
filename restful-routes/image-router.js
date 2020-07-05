const express = require('express');

const imageRouter = express.Router();

const authImageRouter = express.Router();

// image search
imageRouter.route('/Images')
  .get((req, res) => {
    if (req.query.location) {
      return res
        .status(200)
        .json({ data: 'images and properties data' });
    }
    if (req.query.type) {
      return res
        .status(200)
        .json({ data: 'images and properties data' });
    }
    if (req.query.location && req.query.type) {
      return res
        .status(200)
        .json({ data: 'images and properties data' });
    }
    if (req.query.imageRating) {
      return res
        .status(200)
        .json({ data: 'images and properties data' });
    }
    if (req.query.propertyRating) {
      return res
        .status(200)
        .json({ data: 'images and properties data' });
    }
  });

// image full view
imageRouter.route('/Images/:imageId')
  .get((req, res) => {
    if (req.params.userId) {
      return res
        .status(200)
        .json({ data: 'image and property id' });
    }
  });

// image access by authorized user
authImageRouter.route('/Images/:userId')
  .get((req, res) => {
    if (req.headers.authorization) {
      return res
        .status(200)
        .json({ data: 'image data' });
    }
  })
  .post((req, res) => {
    if (req.params.userId) {
      return res
        .status(200)
        .json({ data: 'new properties\'s id' });
    }
  })
  .delete((req, res) => {
    if (req.headers.authorization) {
      return res
        .status(200)
        .json({ data: 'image data' });
    }
  });

module.exports = { imageRouter, authImageRouter };
