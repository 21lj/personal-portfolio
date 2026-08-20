const TransferOffer = require('../models/TransferOffer');
const Player = require('../models/Player');
const Club = require('../models/Club');
const User = require('../models/User');
const TransferHistory = require('../models/TransferHistory');

// @desc    Send a transfer offer to a player
// @route   POST /api/transfer-offers
// @access  Private (Scout only)
exports.createOffer = async (req, res) => {
  try {
    const {
      playerId,
      offerDetails,
      contractLength,
      offeredPosition
    } = req.body;

    const scoutId = req.user._id;
    const clubId = req.user.representedClubId;

    // 1. Check scout affiliation
    if (!clubId) {
      return res.status(400).json({
        message:
          'Scout is not affiliated with any club. Please request affiliation first.'
      });
    }

    // 2. Verify the affiliated club exists
    const club = await Club.findById(clubId);

    if (!club) {
      return res.status(404).json({
        message: 'Affiliated club not found'
      });
    }

    // 3. Check transfer window
    if (!club.transferWindowOpen) {
      return res.status(400).json({
        message: 'Transfer window is closed for this club'
      });
    }

    // 4. Find target player
    const player = await Player.findById(playerId);

    if (!player) {
      return res.status(404).json({
        message: 'Player not found'
      });
    }

    // 5. Check player availability
    if (player.transferStatus === 'Not Available') {
      return res.status(400).json({
        message: 'Player is not available for transfer'
      });
    }

    // 6. Make sure player isn't already affiliated
    if (player.clubId) {
      return res.status(400).json({
        message: 'Player is already affiliated with a club'
      });
    }

    // 7. Check for an existing pending offer from this scout
    const existingOffer = await TransferOffer.findOne({
      playerId,
      senderId: scoutId,
      clubId,
      status: 'Pending'
    });

    if (existingOffer) {
      return res.status(400).json({
        message: 'You already have a pending offer for this player'
      });
    }

    // 8. Check if another scout from the same club
    //    already made a pending offer
    const clubOffer = await TransferOffer.findOne({
      playerId,
      clubId,
      status: 'Pending'
    });

    if (clubOffer) {
      return res.status(400).json({
        message:
          'Another scout from your club has already sent an offer to this player'
      });
    }

    // 9. Create the transfer offer
    const offer = await TransferOffer.create({
      playerId,
      senderId: scoutId,
      clubId,
      offerDetails,
      contractLength,
      offeredPosition: offeredPosition || player.position
    });

    // 10. Update player transfer status
    await Player.findByIdAndUpdate(playerId, {
      transferStatus: 'Considering Offers'
    });

    return res.status(201).json(offer);

  } catch (error) {
    console.error('Create transfer offer error:', error);

    return res.status(500).json({
      message: error.message
    });
  }
};

// @desc    Get offers received by the logged-in player
// @route   GET /api/transfer-offers/my-offers
// @access  Private (Player only)
exports.getMyOffers = async (req, res) => {
  try {
    if (req.user.role !== 'Player') {
      return res.status(403).json({ message: 'Only players can view their offers' });
    }

    const player = await Player.findOne({ userId: req.user._id });
    if (!player) {
      return res.status(404).json({ message: 'Player profile not found' });
    }

    const offers = await TransferOffer.find({ 
      playerId: player._id,
      status: { $ne: 'Withdrawn' } // Exclude withdrawn offers
    })
      .populate('senderId', 'name email role')
      .populate('clubId', 'clubName location')
      .sort({ createdAt: -1 });

    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Respond to an offer (Accept or Reject)
// @route   PUT /api/transfer-offers/:id/respond
// @access  Private (Player only)
exports.respondToOffer = async (req, res) => {
  try {
    const { status } = req.body; // 'Accepted' or 'Rejected'

    if (!['Accepted', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be Accepted or Rejected' });
    }

    const offer = await TransferOffer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ message: 'Transfer offer not found' });
    }

    // Ensure the offer belongs to the logged-in player
    const player = await Player.findOne({ userId: req.user._id });
    if (!player || offer.playerId.toString() !== player._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to respond to this offer' });
    }

    // Prevent double-processing
    if (offer.status !== 'Pending') {
      return res.status(400).json({ message: 'Offer has already been responded to' });
    }

    // Check if offer has expired
    if (offer.expiryDate && offer.expiryDate < new Date()) {
      offer.status = 'Expired';
      await offer.save();
      return res.status(400).json({ message: 'Offer has expired' });
    }

    offer.status = status;
    offer.respondedAt = new Date();
    await offer.save();

    // On acceptance: enroll player and clean up competing offers
    if (status === 'Accepted') {
      const currentPlayer = await Player.findById(player._id);

      // Race-condition guard
      if (currentPlayer.clubId) {
        return res.status(400).json({ message: 'You are already affiliated with a club' });
      }

      // 1. Create transfer history record
      await TransferHistory.create({
        playerId: player._id,
        fromClubId: currentPlayer.clubId, // null for free agent
        toClubId: offer.clubId,
        offerId: offer._id,
        contractLength: offer.contractLength,
        initiatedBy: offer.senderId,
        transferType: 'Permanent',
        notes: `Transferred via scout offer from ${offer.senderId.name}`,
      });

      // 2. Assign player to club
      currentPlayer.clubId = offer.clubId;
      currentPlayer.joinedClubDate = new Date();
      currentPlayer.transferStatus = 'Not Available';
      await currentPlayer.save();

      // 3. Add player to club roster
      await Club.findByIdAndUpdate(offer.clubId, {
        $addToSet: { enrolledPlayers: player._id },
      });

      // 4. Auto-reject all other pending offers for this player
      await TransferOffer.updateMany(
        { playerId: player._id, status: 'Pending', _id: { $ne: offer._id } },
        { status: 'Rejected', respondedAt: new Date() }
      );
    } else {
      // Player rejected the offer - reset their status if no other pending offers
      const otherPendingOffers = await TransferOffer.countDocuments({
        playerId: player._id,
        status: 'Pending'
      });

      if (otherPendingOffers === 0) {
        await Player.findByIdAndUpdate(player._id, {
          transferStatus: 'Available'
        });
      }
    }

    res.json(offer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get offers sent by the logged-in scout
// @route   GET /api/transfer-offers/sent
// @access  Private (Scout)
exports.getSentOffers = async (req, res) => {
  try {
    if (req.user.role !== 'Scout') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const offers = await TransferOffer.find({ senderId: req.user._id })
      .populate({
        path: "playerId",
        select: "age position preferredFoot transferStatus",
        populate: {
          path: "userId",
          select: "name"
        }
      })
      .populate('clubId', 'clubName location')
      .sort({ createdAt: -1 });

    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get complete offer history for scout (including withdrawn/rejected)
// @route   GET /api/transfer-offers/history
// @access  Private (Scout)
exports.getOfferHistory = async (req, res) => {
  try {
    if (req.user.role !== 'Scout') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const offers = await TransferOffer.find({ senderId: req.user._id })
      .populate({
        path: "playerId",
        select: "age position preferredFoot",
        populate: {
          path: "userId",
          select: "name"
        }
      })
      .populate('clubId', 'clubName location')
      .sort({ createdAt: -1 });

    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Withdraw an offer
// @route   PUT /api/transfer-offers/:id/withdraw
// @access  Private (Scout)
exports.withdrawOffer = async (req, res) => {
  try {
    if (req.user.role !== 'Scout') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const offer = await TransferOffer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ message: 'Transfer offer not found' });
    }

    // Ensure the offer belongs to the logged-in scout
    if (offer.senderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to withdraw this offer' });
    }

    // Can only withdraw pending offers
    if (offer.status !== 'Pending') {
      return res.status(400).json({ message: 'Cannot withdraw an offer that has already been processed' });
    }

    offer.status = 'Withdrawn';
    offer.withdrawnAt = new Date();
    await offer.save();

    // Check if player has other pending offers
    const otherPendingOffers = await TransferOffer.countDocuments({
      playerId: offer.playerId,
      status: 'Pending'
    });

    if (otherPendingOffers === 0) {
      await Player.findByIdAndUpdate(offer.playerId, {
        transferStatus: 'Available'
      });
    }

    res.json({ message: 'Offer withdrawn successfully', offer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};