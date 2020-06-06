const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

module.exports = async (mail, subject, text, html) => {
  const transport = nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: process.env.MAILTRAP_SMTP_USERNAME,
      pass: process.env.MAILTRAP_SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: 'noreply@howmiesenterprises.com',
    to: mail,
    subject,
    text,
    html,
  };

  return transport.sendMail(mailOptions);
};
