const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    originalUrl: {
      type: String,
      required: [true, 'Original URL is required'],
      trim: true,
    },
    shortCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    customAlias: {
      type: String,
      default: null,
      trim: true,
      sparse: true, // allows multiple null values
    },
    clickCount: {
      type: Number,
      default: 0,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'disabled'],
      default: 'active',
    },
    lastVisited: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Virtual: is this URL expired?
urlSchema.virtual('isExpired').get(function () {
  if (!this.expiryDate) return false;
  return new Date() > this.expiryDate;
});

urlSchema.set('toJSON', { virtuals: true });
urlSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Url', urlSchema);
