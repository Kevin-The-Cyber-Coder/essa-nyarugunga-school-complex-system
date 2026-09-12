const express = require('express');

const Contact = require('../models/Contact');
const emailTransporter = require('../config/email');
const authMiddleware = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');

const router = express.Router();

router.post('/contact/submit', async (req, res) => {
  try {
    const { fullName, email, phone, subject, message } = req.body;
    const contact = await Contact.create({ fullName, email, phone, subject, message });
    if (process.env.EMAIL_USER) {
      emailTransporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL || 'admin@essa.rw',
        subject: `📬 New Contact from ${fullName}`,
        html: `<p><b>Name:</b> ${fullName}</p><p><b>Email:</b> ${email}</p><p><b>Phone:</b> ${phone || '-'}</p><p><b>Subject:</b> ${subject || '-'}</p><p><b>Message:</b> ${message}</p>`
      }).catch(console.error);
    }
    res.json({ success: true, message: 'Message sent successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/admin/contacts', authMiddleware, requireRole('super_admin'), async (req, res) => {
  const contacts = await Contact.find().sort({ createdAt: -1 });
  res.json(contacts);
});

module.exports = router;