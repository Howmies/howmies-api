const dotenv = require('dotenv');
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const passport = require('passport');

dotenv.config();

const app = express();
const server = express();

// require app routes
const UserSignup = require('./routes/UserSignup');
const UserLogin = require('./routes/UserLogin');
const FacebookLogin = require('./routes/FacebookLogin');
const GoogleLogin = require('./routes/GoogleLogin');
const PasswordReset = require('./routes/PasswordReset');
const RefreshToken = require('./routes/RefreshToken');
const UserSignout = require('./routes/UserSignout');
const PostProperty = require('./routes/PostProperty');
const PostImages = require('./routes/PostImages');
const PropertySearch = require('./routes/PropertySearch');

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  // res.setHeader('Access-Control-Allow-Origin', process.env.ACCESS_CONTROL_ALLOW_ORIGIN);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization, Set-Cookie');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Expose-Headers', 'Authorization');
  next();
});

app.use(cors({
  origin: ['https://localhost:8080', 'http://dev.howmies.com', 'https://dev.howmies.com'],
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

const checkAPI = (resMessage = 'OK!') => express.Router().get('/', (req, res) => res.send({ message: resMessage }));

app.use('/auth/users', [UserSignup, UserLogin, UserSignout]);
app.use('/auth/facebook', FacebookLogin);
app.use('/auth/google', GoogleLogin);
app.use('/password', PasswordReset);
app.use('/auth', RefreshToken);
app.use('/auth/properties', [PostProperty, PostImages]);
app.use('/properties', PropertySearch);

server.use('/api', checkAPI('OK! Howmies'));
server.use('/api/v0.0.1', [checkAPI('Welcome! Howmies'), app]);

module.exports = server;
