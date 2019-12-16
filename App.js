const express = require('express');

const app = express();

const realEstateAgent = require('./Router/RealEstateAgent');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/auth/real_estate_agents', realEstateAgent);

module.exports = app;
