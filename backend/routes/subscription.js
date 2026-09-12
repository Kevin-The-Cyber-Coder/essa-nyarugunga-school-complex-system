const express = require('express');
const router = express.Router();
const Subscription = require('../models/Subscription');
const { sendNewsletterEmail } = require('../utils/emailService');

// Subscribe to newsletter (public)
router.post('/', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    
    // Check if already subscribed
    let subscription = await Subscription.findOne({ email });
    
    if (subscription) {
      if (!subscription.isActive) {
        subscription.isActive = true;
        subscription.unsubscribedAt = null;
        await subscription.save();
        return res.json({ 
          success: true, 
          message: 'Welcome back! You have been resubscribed to our newsletter.' 
        });
      }
      return res.json({ 
        success: true, 
        message: 'You are already subscribed to our newsletter!' 
      });
    }
    
    // New subscription
    subscription = new Subscription({ email });
    await subscription.save();
    
    // Send welcome email
    await sendNewsletterEmail(email, 'welcome');
    
    res.json({ 
      success: true, 
      message: 'Thank you for subscribing! You will receive our latest updates.' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Unsubscribe (public)
router.post('/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;
    
    const subscription = await Subscription.findOne({ email });
    if (subscription) {
      subscription.isActive = false;
      subscription.unsubscribedAt = Date.now();
      await subscription.save();
    }
    
    res.json({ success: true, message: 'You have been unsubscribed from our newsletter.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all subscribers (admin only)
router.get('/', auth, async (req, res) => {
  try {
    const subscribers = await Subscription.find({ isActive: true })
      .sort({ subscribedAt: -1 });
    res.json({ success: true, data: subscribers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Send newsletter to all subscribers (admin only)
router.post('/send-newsletter', auth, async (req, res) => {
  try {
    const { subject, content } = req.body;
    const subscribers = await Subscription.find({ isActive: true });
    
    let sentCount = 0;
    for (const subscriber of subscribers) {
      await sendNewsletterEmail(subscriber.email, 'newsletter', { subject, content });
      sentCount++;
    }
    
    res.json({ 
      success: true, 
      message: `Newsletter sent to ${sentCount} subscribers` 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;