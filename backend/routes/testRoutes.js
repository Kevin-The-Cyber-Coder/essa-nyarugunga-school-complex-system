const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ 
    message: 'Server is running!',
    timestamp: new Date().toISOString(),
    status: 'online'
  });
});

router.post('/echo', (req, res) => {
  res.json({ 
    message: 'Echo: ' + JSON.stringify(req.body),
    received: req.body
  });
});

module.exports = router;