const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    req.userId   = decoded.id;
    req.userRole = decoded.role;
    req.userName = decoded.name;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authMiddleware;