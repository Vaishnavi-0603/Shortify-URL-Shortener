const UAParser = require('ua-parser-js');

/**
 * Parses request headers to extract visitor metadata for analytics.
 */
const parseVisitorData = (req) => {
  const ua = req.headers['user-agent'] || '';
  const parser = new UAParser(ua);
  const result = parser.getResult();

  // Determine device type
  let device = 'desktop';
  if (result.device.type === 'mobile') device = 'mobile';
  else if (result.device.type === 'tablet') device = 'tablet';
  else if (!result.device.type) device = 'desktop';
  else device = 'unknown';

  // Referrer — strip to domain only for readability
  let referrer = req.headers['referer'] || req.headers['referrer'] || 'Direct';
  if (referrer !== 'Direct') {
    try {
      referrer = new URL(referrer).hostname;
    } catch {
      referrer = 'Direct';
    }
  }

  // Real IP (handles proxies / Render / Vercel)
  const ip =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    'Unknown';

  return {
    browser: result.browser.name || 'Unknown',
    os: result.os.name || 'Unknown',
    device,
    referrer,
    ip,
    country: req.headers['cf-ipcountry'] || 'Unknown', // Cloudflare header (free)
  };
};

module.exports = { parseVisitorData };
