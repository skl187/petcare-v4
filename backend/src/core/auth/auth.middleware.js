// src/core/auth/auth.middleware.js
const { verifyToken } = require('./jwt.service');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid or expired token',
      timestamp: new Date().toISOString()
    });
  }
};

const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication required',
      timestamp: new Date().toISOString()
    });
  }
  next();
};

module.exports = { authMiddleware, requireAuth };
