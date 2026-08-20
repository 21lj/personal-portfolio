const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    age: { type: Number, required: true },
    position: {
      type: String,
      required: true,
      enum: ['Goalkeeper', 'Defender', 'Midfielder', 'Striker', 'Winger'],
    },
    secondaryPosition: {
      type: String,
      enum: ['Goalkeeper', 'Defender', 'Midfielder', 'Striker', 'Winger', null],
      default: null,
    },
    preferredFoot: { type: String, enum: ['Left', 'Right', 'Both'], default: 'Right' },
    height: { type: Number }, 
    weight: { type: Number }, 
    clubId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club',
      default: null,
    },
    videoUrl: { type: String, default: '' },
    bio: { type: String, default: '' },
    transferStatus: {
      type: String,
      enum: ['Available', 'Considering Offers', 'Not Available', 'In Negotiations'],
      default: 'Available',
    },
    contractExpiryDate: {
      type: Date,
      default: null,
    },
    visibleToScouts: {
      type: Boolean,
      default: true,
    },
    joinedClubDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Index for faster queries
PlayerSchema.index({ clubId: 1, transferStatus: 1 });
PlayerSchema.index({ userId: 1 });

module.exports = mongoose.model('Player', PlayerSchema);