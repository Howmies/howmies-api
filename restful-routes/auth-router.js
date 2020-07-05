const express = require('express');

const authRouter = express.Router();

authRouter.route('/Auths/:authId')
  .put((req, res) => {
    if (req.headers.authorization) {
      return res
        .status(201)
        .json();
    }
  });

module.exports = authRouter;
