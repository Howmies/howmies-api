// Import packages
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const mailer = require('../middleware/emails');
const pool = require('../middleware/configs/elephantsql');

dotenv.config();

const privateKey = process.env.RSA_PRIVATE_KEY;

// gets password and sends mail to user
module.exports.forgotPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).send({ message: errors.array() });
  }

  const { email } = req.body;
  const user = await pool
    .query('SELECT * FROM users WHERE email=$1', [email])
    .then((result) => {
      if (result.rows && result.rows.length > 0) {
        return {
          data: {
            uid: result.rows[0].id,
            name: `${result.rows[0].first_name} ${result.rows[0].last_name}`,
            passwordCrypt: result.rows[0].password,
          },
        };
      }
    })
    .catch(() => ({ error: 'Internal Server Error. Try again' }));
  if (user && user.error) {
    return res.status(500).send({
      remark: 'Error',
      message: user.error,
    });
  }

  if (!user || !user.data) {
    return res.status(403).send({
      remark: 'Error',
      message: 'Incorrect email',
    });
  }

  const expiresIn = '20m';
  const aud = 'user';
  const iss = 'Howmies Entreprise';
  const algorithm = 'HS256';
  const { uid, passwordCrypt } = user.data;

  if (user) {
    const token = jwt.sign(
      {
        iss, aud, passwordCrypt,
      },
      privateKey,
      { expiresIn, algorithm },
    );
    const html = `<a href="${process.env.DOMAIN_NAME}/api/v0.0.1/forgotPassword/${uid}/${token}">Reset password</a>`;
    const subject = 'Password Reset';
    const text = 'Reset your password';
    await mailer(email, html, subject, text)
      .then((re) => {
        res.send(re);
      })
      .catch((err) => {
        res
          .status(400)
          .send({
            message: 'Something failed while sending mail!',
            error: err,
          });
      });
  }
};

// returns a form for the user to update their password
module.exports.resetForm = async (req, res) => {
  const { id, resetToken } = req.params;
  const user = await pool.query('SELECT * FROM users WHERE id=$1', [id])
    .then((result) => {
      if (result.rows
      && result.rows.length > 0) {
        return {
          data: {
            password: result.rows[0].password,
          },
        };
      }
    }).catch(() => ({ error: 'Internal Server Error. Try again' }));

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
  <form action="/api/v0.0.1/resetPassword/${id}/${resetToken}" method="POST" style='width: 70vw;' class="needs-validation"> 
      <div class="form-group">
        <label for="password">New Password</label>
        <input type="password" name="password" class="form-control" id="password" placeholder="Enter your new password..." pattern=[A-Za-z0-9]{8,24}> 
      </div>
      <div class="form-group">
        <label for="passwordconfirmation">Confirm New Password</label>
        <input type="password" class="form-control" id="confirmpassword" placeholder="Confirm your new Password">
      </div>
        <input type="submit" class="btn btn-primary" value="Reset Password"/> 
    </form>
  </div>

  <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"></script>
  <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js" integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" crossorigin="anonymous"></script>

  </body>
</html>`;


  jwt.verify(resetToken, privateKey, {
    algorithms: ['HS256'],
    expiresIn: '20m',
  }, (err, decoded) => {
    if (err && err.name === 'TokenExpiredError') {
      const message = `
    <!doctype html>
      <html lang="en">
      <head>
      <meta charset="utf-8">

      </head>
      <body>
    <h1>Password Reset Timeout</h1>
    <p>Time required to perform this operation has elapsed and the link has expired.</p>
    </body>
    </html>
    `;
      return res.send('Link expired');
    }
    if (user.data && user.data.password !== decoded.passwordCrypt) {
      return res.send('Invalid link');
    }
    return res.send(form);
  });
};

// updates the password in the db
module.exports.updatePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).send({ message: errors.array() });
  }
  const { id } = req.params;
  const { password } = req.body;

  const salt = bcrypt.genSaltSync(10);
  const passwordCrypt = bcrypt.hashSync(password, salt);
  await pool.query(
    `UPDATE users 
    SET password=$1 
    WHERE id=$2 
    RETURNING *`,
    [
      passwordCrypt,
      id,
    ],
  ).then((result) => res.send('Password Reset Successful'))
    .catch((err) => res.status(500).send('An Error occured while updating password, try again'));
};
