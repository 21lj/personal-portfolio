const mongoose = require('mongoose');

const TransferHistorySchema = new mongoose.Schema(
  {
    playerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      required: true,
    },
    fromClubId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club',
      default: null,
    },
    toClubId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club',
      required: true,
    },
    offerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TransferOffer',
    },
    transferDate: {
      type: Date,
      default: Date.now,
    },
    contractLength: {
      type: String,
    },
    contractExpiryDate: {
      type: Date,
    },
    initiatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    transferType: {
      type: String,
      enum: ['Permanent', 'Loan'],
      default: 'Permanent',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Index for faster queries
TransferHistorySchema.index({ playerId: 1, transferDate: -1 });
TransferHistorySchema.index({ fromClubId: 1 });
TransferHistorySchema.index({ toClubId: 1 });

module.exports = mongoose.model('TransferHistory', TransferHistorySchema);