const express = require('express');

// require app routes
const UserSignup = require('./UserSignup');
const UserLogin = require('./UserLogin');
const FacebookLogin = require('./FacebookLogin');
const GoogleLogin = require('./GoogleLogin');
const PasswordReset = require('./PasswordReset');
const RefreshToken = require('./RefreshToken');
const UserSignout = require('./UserSignout');
const PostProperty = require('./PostProperty');
const PostImages = require('./PostImages');
const PropertySearch = require('./PropertySearch');

const app = express();

app.use('/users', [UserSignup, UserLogin]);
app.use('/auth/users', UserSignout);
app.use('/auth/facebook', FacebookLogin);
app.use('/auth/google', GoogleLogin);
app.use('/password', PasswordReset);
app.use('/auth', RefreshToken);
app.use('/auth/properties', [PostProperty, PostImages]);
app.use('/properties', PropertySearch);

module.exports = app;
