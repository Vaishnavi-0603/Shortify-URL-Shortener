const Url = require('../models/Url');
const { generateShortCode } = require('../services/shortCodeService');
const { AppError, catchAsync } = require('../utils/errors');

// POST /api/urls
const createUrl = catchAsync(async (req, res) => {
  const { originalUrl, customAlias, expiryDate } = req.body;

  // Resolve short code — prefer custom alias
  let shortCode;
  if (customAlias) {
    const exists = await Url.exists({ shortCode: customAlias });
    if (exists) throw new AppError('Custom alias already taken', 409);
    shortCode = customAlias;
  } else {
    shortCode = await generateShortCode();
  }

  const url = await Url.create({
    userId: req.user._id,
    originalUrl,
    shortCode,
    customAlias: customAlias || null,
    expiryDate: expiryDate || null,
  });

  res.status(201).json({ success: true, data: url });
});

// GET /api/urls
const getUrls = catchAsync(async (req, res) => {
  const urls = await Url.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, data: urls });
});

// PUT /api/urls/:id
const updateUrl = catchAsync(async (req, res) => {
  const url = await Url.findOne({ _id: req.params.id, userId: req.user._id });
  if (!url) throw new AppError('URL not found', 404);

  const { originalUrl, status, expiryDate } = req.body;
  if (originalUrl !== undefined) url.originalUrl = originalUrl;
  if (status !== undefined) url.status = status;
  if (expiryDate !== undefined) url.expiryDate = expiryDate || null;

  await url.save();
  res.json({ success: true, data: url });
});

// DELETE /api/urls/:id
const deleteUrl = catchAsync(async (req, res) => {
  const url = await Url.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!url) throw new AppError('URL not found', 404);

  // Clean up associated visits
  const Visit = require('../models/Visit');
  await Visit.deleteMany({ urlId: url._id });

  res.json({ success: true, message: 'URL deleted' });
});

module.exports = { createUrl, getUrls, updateUrl, deleteUrl };
