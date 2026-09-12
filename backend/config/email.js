const nodemailer = require('nodemailer');

const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: { rejectUnauthorized: false }
});

emailTransporter.verify((error) => {
  if (error) console.error('❌ Email config error:', error.message);
  else console.log('✅ Email configured for:', process.env.EMAIL_USER);
});

module.exports = emailTransporter;