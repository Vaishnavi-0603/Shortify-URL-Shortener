const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema(
  {
    urlId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Url',
      required: true,
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    browser: {
      type: String,
      default: 'Unknown',
    },
    os: {
      type: String,
      default: 'Unknown',
    },
    device: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet', 'unknown'],
      default: 'unknown',
    },
    country: {
      type: String,
      default: 'Unknown',
    },
    referrer: {
      type: String,
      default: 'Direct',
    },
    ip: {
      type: String,
      default: 'Unknown',
    },
  },
  { timestamps: false }
);

module.exports = mongoose.model('Visit', visitSchema);
