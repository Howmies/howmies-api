// Import packages
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const mailer = require('../middleware/EmailHandler');
const pool = require('../middleware/configs/elephantsql');
const SessionValidator = require('../middleware/SessionValidator');

dotenv.config();

const fetchUserFromDB = async (email, res) => pool
  .query('SELECT * FROM users WHERE email=$1', [email])
  .then((result) => {
    if (result.rows && result.rows.length === 1) {
      return {
        firstName: result.rows[0].first_name,
        uid: result.rows[0].id,
        passwordCrypt: result.rows[0].password,
      };
    }

    return {
      error: () => res.status(403).send({
        remark: 'Error',
        message: 'Incorrect email',
      }),
    };
  })
  .catch(() => ({
    error: () => res.status(500).send({
      remark: 'Error',
      message: 'Internal Server Error. Try again',
    }),
  }));

// gets password and sends mail to user
module.exports.forgotPassword = async (req, res) => {
  // validate user input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).send({ message: errors.array() });
  }

  // check that user exists
  const { email } = req.body;
  const user = await fetchUserFromDB(email, res);

  if (user.error) return user.error();

  // sign jwt
  const expiresIn = 600;
  const aud = 'user';
  const iss = 'Howmies Entreprise';
  const algorithm = 'HS256';

  const token = jwt.sign(
    {
      iss, aud, email,
    },
    user.passwordCrypt,
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
    .then((response) => {
      res.send({
        message: 'Mail sent successfully',
        response,
      });
    })
    .catch((err) => {
      res
        .status(400)
        .send({
          message: 'Internal server error. Please try again',
          error: err,
        });
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

  const user = await fetchUserFromDB(email, res);

  if (user.error) return user.error();

  // verify password reset session

  const tokenVerifier = new SessionValidator(
    resetToken,
    user.passwordCrypt,
    'user',
  );

  if (tokenVerifier.error) {
    return tokenVerifier.errorResponse(res);
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

// updates the password in the db
module.exports.updatePassword = async (req, res) => {
  // validate user request
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).send({ message: errors.array() });

  // check that user exists and return the password hash for token secret

  const { resetToken } = req.params;
  const payload = jwt.decode(resetToken);
  const { email } = payload;

  const user = await fetchUserFromDB(email, res);

  if (user.error) return user.error();

  // verify password reset session

  const tokenVerifier = new SessionValidator(
    resetToken,
    user.passwordCrypt,
    'user',
  );

  if (tokenVerifier.error) {
    return tokenVerifier.errorResponse(res);
  }

  // ensure new password and old password are not the same

  const { password } = req.body;

  if (bcrypt.compareSync(password, user.passwordCrypt)) {
    return res
      .status(400)
      .send('<p>For safety and security, use a different password</p>');
  }

  // update user password

  const salt = bcrypt.genSaltSync(10);
  const passwordCrypt = bcrypt.hashSync(password, salt);

  await pool
    .query(
      'UPDATE users SET password=$1 WHERE email=$2',
      [passwordCrypt, email],
    )
    .then(() => {
      // send confirmation mail to user
      const subject = 'Password Reset Success';
      const html = `<p>Dear ${user.firstName}, <br/> You have successfully changed your password. <br/><br/>Thanks for using our service. <br/> Howmies &copy; 2020</p>`;
      const text = 'Your password has been reset';

      mailer(email, subject, text, html).catch(() => null);
      return res.send('<p style=\'font-size: 20px;\'>Password reset successful. You can now login</p>');
    })
    .catch(() => res.status(500).send('Internal server error. Try again'));
};
