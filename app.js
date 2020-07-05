const dotenv = require('dotenv');
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const passport = require('passport');

dotenv.config();

const server = express();

server.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  // res.setHeader('Access-Control-Allow-Origin', process.env.ACCESS_CONTROL_ALLOW_ORIGIN);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization, Set-Cookie');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Expose-Headers', 'Authorization');
  next();
});

server.use(cors({
  origin: ['https://localhost:8080', 'http://dev.howmies.com', 'https://dev.howmies.com'],
}));
server.use(express.urlencoded({ extended: true }));
server.use(express.json());
server.use(cookieParser());
server.use(passport.initialize());

const checkAPI = (resMessage = 'OK!') => express.Router().get('/', (req, res) => res.send({ message: resMessage }));

server.use('/api', checkAPI('OK! Howmies'));
server.use('/api/v0.0.1', [checkAPI('Welcome! Howmies'), app]);

module.exports = server;
