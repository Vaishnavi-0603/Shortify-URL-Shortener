const Visit = require('../models/Visit');
const Url = require('../models/Url');
const { AppError, catchAsync } = require('../utils/errors');

// GET /api/analytics/:urlId
const getAnalytics = catchAsync(async (req, res) => {
  const url = await Url.findOne({ _id: req.params.urlId, userId: req.user._id });
  if (!url) throw new AppError('URL not found', 404);

  const visits = await Visit.find({ urlId: url._id }).sort({ timestamp: -1 });

  // --- Aggregation helpers ---
  const countBy = (field) =>
    visits.reduce((acc, v) => {
      const key = v[field] || 'Unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

  const topN = (obj, n = 5) =>
    Object.entries(obj)
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([name, count]) => ({ name, count }));

  // Daily clicks for the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const dailyMap = {};
  visits
    .filter((v) => v.timestamp >= thirtyDaysAgo)
    .forEach((v) => {
      const day = v.timestamp.toISOString().split('T')[0];
      dailyMap[day] = (dailyMap[day] || 0) + 1;
    });

  const dailyClicks = Object.entries(dailyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));

  res.json({
    success: true,
    data: {
      url,
      totalClicks: url.clickCount,
      lastVisited: url.lastVisited,
      recentVisits: visits.slice(0, 10),
      topBrowsers: topN(countBy('browser')),
      topOs: topN(countBy('os')),
      topDevices: topN(countBy('device')),
      topCountries: topN(countBy('country')),
      dailyClicks,
    },
  });
});

module.exports = { getAnalytics };
