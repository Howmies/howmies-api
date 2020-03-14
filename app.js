const express = require('express');

const app = express();
const server = express();

const UserSignup = require('./routes/UserSignup');
const UserLogin = require('./routes/UserLogin');
const PostProperty = require('./routes/PostProperty');
const PostImages = require('./routes/PostImages');

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const checkAPI = (resMessage = 'OK!') => express.Router().get('/', (req, res) => res.send({ message: resMessage }));

app.use('/auth/users', [UserSignup, UserLogin]);
app.use('/auth', PostProperty);
app.use('/auth', PostImages);

server.use(checkAPI('OK! Howmies'));
server.use('/api/v0.0.1', [checkAPI('Welcome! Howmies'), app]);

module.exports = server;
