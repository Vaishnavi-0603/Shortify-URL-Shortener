const { verifyToken } = require('../utils/jwt');
const { AppError } = require('../utils/errors');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return next(new AppError('Authentication required', 401));
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await User.findById(decoded.id);
    if (!user) return next(new AppError('User no longer exists', 401));

    req.user = user;
    next();
  } catch {
    next(new AppError('Invalid or expired token', 401));
  }
};

module.exports = { protect };
