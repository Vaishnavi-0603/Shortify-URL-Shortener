const User = require('../models/User');
const { signToken } = require('../utils/jwt');
const { AppError, catchAsync } = require('../utils/errors');

// POST /api/auth/register
const register = catchAsync(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) throw new AppError('Email already in use', 409);

  const user = await User.create({ name, email, passwordHash: password });
  const token = signToken(user._id);

  res.status(201).json({
    success: true,
    token,
    user: { id: user._id, name: user.name, email: user.email },
  });
});

// POST /api/auth/login
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = signToken(user._id);

  res.json({
    success: true,
    token,
    user: { id: user._id, name: user.name, email: user.email },
  });
});

// GET /api/auth/me
const getMe = catchAsync(async (req, res) => {
  res.json({
    success: true,
    user: { id: req.user._id, name: req.user.name, email: req.user.email },
  });
});

module.exports = { register, login, getMe };
