const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.userRole)) return res.status(403).json({ message: 'Access denied' });
  next();
};

module.exports = requireRole;