const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError.js');
const asyncHandler = require('../utils/asyncHandler.js');

const requireAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication token is missing', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    return next();
  } catch (err) {
    return next(new AppError('Invalid or expired authentication token', 401));
  }
});

module.exports = requireAuth;