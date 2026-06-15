const { nanoid } = require('nanoid');
const Url = require('../models/Url');

/**
 * Generates a unique 7-character short code.
 * Retries on collision (extremely rare with nanoid).
 */
const generateShortCode = async () => {
  let code;
  let exists = true;

  while (exists) {
    code = nanoid(7);
    exists = await Url.exists({ shortCode: code });
  }

  return code;
};

module.exports = { generateShortCode };
