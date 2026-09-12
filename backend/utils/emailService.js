const emailTransporter = require('../config/email');
const Subscription = require('../models/Subscription');

const sendWelcomeEmail = async (user) => {
  if (!process.env.EMAIL_USER) return;
  await emailTransporter.sendMail({
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: `Welcome to ESSA Nyarugunga Portal, ${user.fullName}!`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:linear-gradient(135deg,#1a3a5c,#2c5f8a);color:white;padding:30px;text-align:center;border-radius:10px 10px 0 0;">
        <h2>🎓 Welcome to ESSA Nyarugunga Portal</h2></div>
      <div style="background:#f5f5f5;padding:30px;border-radius:0 0 10px 10px;">
        <h3>Dear ${user.fullName},</h3>
        <p>Your account has been created successfully.</p>
        <div style="background:white;padding:15px;border-radius:8px;border-left:4px solid #ffc107;">
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Password:</strong> ${user.tempPassword || 'Set by administrator'}</p>
          <p><strong>Role:</strong> ${user.role?.toUpperCase()}</p>
        </div>
        <p>Best regards,<br><strong>ESSA Nyarugunga Administration</strong></p>
      </div></div>`
  });
};

const sendNewsNotificationEmail = async (news) => {
  if (!process.env.EMAIL_USER) return;
  const subscribers = await Subscription.find({ isActive: true });
  for (const sub of subscribers) {
    await emailTransporter.sendMail({
      from: process.env.EMAIL_USER,
      to: sub.email,
      subject: `📰 New: ${news.title} - ESSA Nyarugunga`,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:linear-gradient(135deg,#1a3a5c,#2c5f8a);color:white;padding:20px;text-align:center;"><h2>📢 New Update</h2></div>
        <div style="padding:20px;"><h3>${news.title}</h3><p>${news.summary}</p></div></div>`
    }).catch(console.error);
  }
};

const sendAdmissionConfirmationEmail = async (application) => {
  if (!process.env.EMAIL_USER) return;
  await emailTransporter.sendMail({
    from: process.env.EMAIL_USER,
    to: application.email,
    subject: `🎓 Admission Application Received - ESSA Nyarugunga`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:linear-gradient(135deg,#1a3a5c,#2c5f8a);color:white;padding:20px;text-align:center;"><h2>Application Received!</h2></div>
      <div style="padding:20px;background:#f5f5f5;">
        <h3>Dear ${application.fullName},</h3>
        <p>Application Number: <strong>${application.applicationNumber}</strong></p>
        <p>Status: Pending Review. We'll contact you within 3–5 business days.</p>
      </div></div>`
  });
};

module.exports = { sendWelcomeEmail, sendNewsNotificationEmail, sendAdmissionConfirmationEmail };