const mongoose = require('mongoose');

const PerformanceSchema = new mongoose.Schema(
  {
    playerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      required: true,
    },
    matchName: {
      type: String,
      required: [true, 'Please add match details/name'],
    },
    matchDate: {
      type: Date,
      default: Date.now,
    },
    competition: {
      type: String,
      default: 'League',
    },
    opponent: {
      type: String,
    },
    goals: { type: Number, default: 0 },
    assists: { type: Number, default: 0 },
    passingAccuracy: { type: Number, default: 0 }, // Percentage 0 - 100
    dribbles: { type: Number, default: 0 },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    minutesPlayed: {
      type: Number,
      min: 0,
      max: 120,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index for faster queries
PerformanceSchema.index({ playerId: 1, matchDate: -1 });

module.exports = mongoose.model('Performance', PerformanceSchema);