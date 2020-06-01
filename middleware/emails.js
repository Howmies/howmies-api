const nodemailer = require('nodemailer');

module.exports = async (mail, html, subject, text) => {
  const transport = nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: '04c1f3a2415a49',
      pass: 'b2db7ab932deb2',
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
