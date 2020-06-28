// Import packages
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const mailer = require('../utils/EmailHandler');
const Users = require('../models/users-model');
const errorHandler = require('../utils/error-handler');
const sessionValidator = require('../utils/session-validator');
const HashHandler = require('../utils/hash-handler');

dotenv.config();

function UserException(message) {
  this.message = message;
  this.name = 'UserException';
}

const fetchUserFromDB = async (req, res, email) => Users.getByEmail(email)
  .then((result) => {
    if (result) {
      return {
        firstName: result.first_name,
        uid: result.id,
        passwordHash: result.password,
      };
    }
    throw new UserException('User does not exist');
  })
  .catch((err) => {
    if (err instanceof UserException) {
      return {
        error: () => errorHandler(req, res, 401),
      };
    }
    return {
      error: () => errorHandler(req, res),
    };
  });

// gets password and sends mail to user
module.exports.forgotPassword = async (req, res) => {
  // validate user input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).send({ message: errors.array() });
  }

  // check that user exists
  const { email } = req.body;
  const user = await fetchUserFromDB(req, res, email);

  if (user.error) return user.error();

  // sign jwt
  const expiresIn = 600;
  const aud = 'user';
  const iss = 'Howmies Entreprise';
  const algorithm = 'HS256';
  const { uid } = user;

  const token = jwt.sign(
    {
      iss, aud, email, uid,
    },
    user.passwordHash,
    { expiresIn, algorithm },
  );

  // send mail
  const html = `
  <div style='display: flex; flex-direction: column; align-items: center'>
  <div>
  <p>Dear ${user.firstName},</p>
  <p>We received a request to reset your password.</p>
  <p>Follow this link to reset your password ➡ <a href="${process.env.ACCESS_CONTROL_ALLOW_ORIGIN}/api/v0.0.1/password/forgot_password/${token}">Reset password Link</a> </p>
  <p>If you didn’t ask to reset your password, you can ignore this email.</p>
  <p>Thanks <br/> Howmies Team</p>
  </div>
  </div>`;
  const subject = 'Password Reset';
  const text = 'Reset your password';

  mailer(email, subject, text, html)
    .catch((err) => {
      res
        .status(400)
        .send({
          message: 'Internal server error. Please try again',
          error: err,
        });
    });
  res.send({
    message: 'Mail sent successfully',
  });
};

// returns a form for the user to update their password
module.exports.resetForm = async (req, res) => {
  // validate user request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).send('<p>Invalid Link</p>');
  }

  // check that user exists and return the password hash for token secret

  const { resetToken } = req.params;
  const payload = jwt.decode(resetToken);
  const { email } = payload;

  const user = await fetchUserFromDB(req, res, email);

  if (user.error) return user.error();

  // verify password reset session

  try {
    await sessionValidator(
      resetToken,
      user.passwordHash,
      'user',
    );
  } catch (error) {
    errorHandler(req, res, 403);
  }

  const form = `
  <!doctype html>
  <html lang="en">
    <head>
      <!-- Required meta tags -->
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

      <!-- Bootstrap CSS -->
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">

      <title>Password Reset!</title>
    </head>
    <body>
      <div class="container form-group" style='display: flex; flex-direction: column; justify-content: center; align-items: center; height: 80vh'>
        <h2>Reset Your Password</h2>
        <p>Take care and ensure that you DO NOT use a password that has been used before</p>
        <form action="/api/v0.0.1/password/reset_password/${resetToken}" method="POST" style='width: 70vw;' class="needs-validation"> 
          <div class="form-group">
            <label for="password">New Password</label>
            <input type="password" name="password" class="form-control" id="password" placeholder="Enter your new password..." pattern=[A-Za-z0-9\\W]{8,24}> 
          </div>
          <div class="form-group">
            <label for="passwordconfirmation">Confirm New Password</label>
            <input type="password" name="confirmPassword" class="form-control" id="confirmPassword" placeholder="Confirm your new password">
          </div>
            <input type="submit" class="btn btn-primary" value="Reset Password"/> 
        </form>
      </div>

      <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"></script>
      <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js" integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" crossorigin="anonymous"></script>

    </body>
  </html>`;

  return res.send(form);
};

// updates the password in the database
module.exports.updatePassword = async (req, res) => {
  // validate user request
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).send({ message: errors.array() });

  // check that user exists and return the password hash for token secret

  const { resetToken } = req.params;
  const payload = jwt.decode(resetToken);
  const { email, uid } = payload;

  const user = await fetchUserFromDB(req, res, email);

  if (user.error) return user.error();

  // verify password reset session

  try {
    await sessionValidator(
      resetToken,
      user.passwordHash,
      'user',
    );
  } catch (err) {
    errorHandler(req, res, 403);
  }

  // ensure new password and old password are not the same

  const { password } = req.body;

  if (HashHandler.verifyHash(password, user.passwordHash)) {
    const responseMessage = `<p style="font-size: 18px; color: red;">
      Use a different password
      </p>`;
    return res
      .status(400)
      .send(responseMessage);
  }

  // update user password

  const passwordHash = HashHandler.generateHash(password);

  Users
    .update(uid, { password: passwordHash })
    .then(() => {
      // send confirmation mail to user
      const subject = 'Password Reset Success';
      const html = `<p>Dear ${user.firstName}, <br/> You have successfully changed your password. <br/><br/>Thanks for using our service. <br/> Howmies &copy; 2020</p>`;
      const text = 'Your password has been reset';

      mailer(email, subject, text, html).catch(() => null);
      res
        .status(200)
        .clearCookie('HURT', { path: '/api/v0.0.1/auth/refresh_token' })
        .removeHeader('Authorization');
      const responseMessage = `<p style="font-size: 18px; color: green;">
      Password reset successful. You can now login
      </p>`;
      return res.send(responseMessage);
    })
    .catch(() => errorHandler(req, res));
};
