const express = require('express');

const Subscription = require('../models/Subscription');

const router = express.Router();

router.post('/subscriptions/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    let sub = await Subscription.findOne({ email });
    if (sub) {
      if (!sub.isActive) { sub.isActive = true; await sub.save(); }
      return res.json({ success: true, message: 'Subscribed successfully!' });
    }
    await Subscription.create({ email });
    res.json({ success: true, message: 'Subscribed successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/subscriptions/unsubscribe', async (req, res) => {
  try {
    await Subscription.findOneAndUpdate({ email: req.body.email }, { isActive: false });
    res.json({ success: true, message: 'Unsubscribed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;