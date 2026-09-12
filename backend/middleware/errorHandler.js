const errorHandler = (err, req, res, next) => {
  console.error('Server error:', err.message);
  if (err.name === 'MulterError') return res.status(400).json({ message: err.message });
  res.status(500).json({ message: err.message || 'Internal Server Error' });
};

module.exports = errorHandler;