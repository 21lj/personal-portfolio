const mongoose = require('mongoose');

const TransferOfferSchema = new mongoose.Schema(
  {
    playerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    clubId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club',
      required: true,
    },
    offerDetails: {
      type: String,
      required: [true, 'Please add offer details or terms'],
    },
    contractLength: {
      type: String,
      required: [true, 'Please specify contract length (e.g., 2 Years)'],
    },
    offeredPosition: {
      type: String,
      enum: ['Goalkeeper', 'Defender', 'Midfielder', 'Striker', 'Winger'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected', 'Withdrawn', 'Expired'],
      default: 'Pending',
    },
    expiryDate: {
      type: Date,
      default: () => new Date(+new Date() + 30 * 24 * 60 * 60 * 1000), // 30 days from creation
    },
    respondedAt: {
      type: Date,
    },
    withdrawnAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Index for faster queries
TransferOfferSchema.index({ playerId: 1, status: 1 });
TransferOfferSchema.index({ senderId: 1, status: 1 });
TransferOfferSchema.index({ clubId: 1, status: 1 });
TransferOfferSchema.index({ expiryDate: 1 });

// Auto-expire offers
// Auto-expire offers
TransferOfferSchema.pre('save', async function () {
  if (
    this.status === 'Pending' &&
    this.expiryDate &&
    this.expiryDate < new Date()
  ) {
    this.status = 'Expired';
  }
});

module.exports = mongoose.model('TransferOffer', TransferOfferSchema);