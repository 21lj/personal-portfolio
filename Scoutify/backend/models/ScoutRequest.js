const mongoose = require('mongoose');

const ScoutRequestSchema = new mongoose.Schema(
  {
    scoutId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    clubId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club',
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    message: {
      type: String,
      default: '',
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    respondedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Ensure unique pending request per scout per club
ScoutRequestSchema.index({ scoutId: 1, clubId: 1, status: 1 }, { unique: true });

module.exports = mongoose.model('ScoutRequest', ScoutRequestSchema);