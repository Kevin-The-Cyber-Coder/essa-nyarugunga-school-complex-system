const roleCheck = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized - Please login' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. ${req.user.role} role does not have permission.`,
        requiredRoles: roles
      });
    }
    
    next();
  };
};

module.exports = roleCheck;