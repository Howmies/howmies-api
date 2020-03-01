const express = require('express');

const app = express();
const server = express();

const UserSignup = require('./routes/UserSignup');
const UserLogin = require('./routes/UserLogin');
const PostProperty = require('./routes/post_properties/PostProperty');
// const multer = require('./middleware/file_upload/multerConfig');
// const PostImages = require('./routes/post_properties/PostImages');

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/auth/users', [UserSignup, UserLogin]);
app.use('/auth', PostProperty);
// app.use('/auth/users/:property_id', multer, PostImages);

server.use('/api/v1', app);

module.exports = server;
