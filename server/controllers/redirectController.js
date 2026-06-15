const Url = require('../models/Url');
const Visit = require('../models/Visit');
const { parseVisitorData } = require('../services/analyticsService');
const { catchAsync } = require('../utils/errors');

// GET /:shortCode
const redirect = catchAsync(async (req, res) => {
  const { shortCode } = req.params;
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  const url = await Url.findOne({ shortCode });

  if (!url) {
    return res.redirect(`${clientUrl}/not-found`);
  }

  if (url.status === 'disabled') {
    return res.redirect(`${clientUrl}/link-disabled`);
  }

  if (url.expiryDate && new Date() > url.expiryDate) {
    return res.redirect(`${clientUrl}/link-expired`);
  }

  // Record visit asynchronously — do not block redirect
  const visitorData = parseVisitorData(req);
  setImmediate(async () => {
    try {
      await Visit.create({ urlId: url._id, ...visitorData });
      await Url.findByIdAndUpdate(url._id, {
        $inc: { clickCount: 1 },
        lastVisited: new Date(),
      });
    } catch (err) {
      console.error('[Analytics] Failed to record visit:', err.message);
    }
  });

  return res.redirect(301, url.originalUrl);
});

module.exports = { redirect };
