const mongoose = require('mongoose');

const ClubSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    clubName: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String, default: '' },
    enrolledPlayers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
      },
    ],
    scouts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      }
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
    transferWindowOpen: {
      type: Boolean,
      default: true,
    },
    transferWindowStart: {
      type: Date,
    },
    transferWindowEnd: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Index for faster queries
ClubSchema.index({ scouts: 1 });
ClubSchema.index({ enrolledPlayers: 1 });

module.exports = mongoose.model('Club', ClubSchema);