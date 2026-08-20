const Player = require('../models/Player');
const Club = require('../models/Club');
const User = require('../models/User');
const TransferHistory = require('../models/TransferHistory');

exports.upsertPlayerProfile = async (req, res) => {
  try {
    const { age, position, secondaryPosition, preferredFoot, height, weight, videoUrl, bio } = req.body;

    // NOTE: clubId is intentionally omitted — players cannot self-assign to clubs.
    // Club membership is granted ONLY through the transfer-offer acceptance flow.
    const profileFields = {
      userId: req.user._id,
      age,
      position,
      secondaryPosition: secondaryPosition || null,
      preferredFoot,
      height,
      weight,
      videoUrl,
      bio,
    };

    let player = await Player.findOne({ userId: req.user._id });

    if (player) {
      player = await Player.findOneAndUpdate(
        { userId: req.user._id },
        { $set: profileFields },
        { new: true }
      );
      return res.json(player);
    }

    player = await Player.create(profileFields);
    res.status(201).json(player);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyPlayerProfile = async (req, res) => {
  try {
    const player = await Player.findOne({ userId: req.user._id })
      .populate('clubId', 'clubName location isVerified');
    
    if (!player) {
      return res.status(404).json({ message: 'Player profile not found' });
    }
    res.json(player);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search and filter players
// @route   GET /api/players/search
// @access  Public / Scout / Club
exports.searchPlayers = async (req, res) => {
  try {
    const { 
      position, 
      secondaryPosition,
      minAge, 
      maxAge, 
      availableOnly, 
      transferStatus,
      minHeight,
      maxHeight,
      preferredFoot,
      limit = 10, 
      page = 1 
    } = req.query;

    let query = {};

    // Clubs/scouts can restrict to unaffiliated players
    if (availableOnly === 'true') {
      query.clubId = null;
    }

    if (position) {
      query.position = position;
    }

    if (secondaryPosition) {
      query.secondaryPosition = secondaryPosition;
    }

    if (transferStatus) {
      query.transferStatus = transferStatus;
    }

    if (preferredFoot) {
      query.preferredFoot = preferredFoot;
    }

    if (minAge || maxAge) {
      query.age = {};
      if (minAge) query.age.$gte = Number(minAge);
      if (maxAge) query.age.$lte = Number(maxAge);
    }

    if (minHeight || maxHeight) {
      query.height = {};
      if (minHeight) query.height.$gte = Number(minHeight);
      if (maxHeight) query.height.$lte = Number(maxHeight);
    }

    // If user is authenticated and not player, hide players with "Not Available" status unless specified
    if (req.user && req.user.role !== 'Player' && !transferStatus) {
      query.transferStatus = { $ne: 'Not Available' };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const players = await Player.find(query)
      .populate('userId', 'name email isVerified')
      .populate('clubId', 'clubName location')
      .limit(Number(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Player.countDocuments(query);

    res.json({
      success: true,
      count: players.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: players,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get available (unaffiliated) players
// @route   GET /api/players/available
// @access  Private (Club & Scout only)
exports.getAvailablePlayers = async (req, res) => {
  try {
    if (!['Club', 'Scout'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized to view available players' });
    }

    const { position, minAge, maxAge, transferStatus, limit = 10, page = 1 } = req.query;

    let query = { 
      clubId: null,
      visibleToScouts: true
    };

    if (position) query.position = position;
    if (transferStatus) query.transferStatus = transferStatus;
    if (minAge || maxAge) {
      query.age = {};
      if (minAge) query.age.$gte = Number(minAge);
      if (maxAge) query.age.$lte = Number(maxAge);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const players = await Player.find(query)
      .populate('userId', 'name email isVerified')
      .limit(Number(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Player.countDocuments(query);

    res.json({
      success: true,
      count: players.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: players,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get player by ID with transfer history
// @route   GET /api/players/:id
// @access  Public
exports.getPlayerById = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id)
      .populate('userId', 'name email isVerified')
      .populate('clubId', 'clubName location isVerified');

    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    // Get transfer history
    const transferHistory = await TransferHistory.find({ playerId: player._id })
      .populate('fromClubId', 'clubName')
      .populate('toClubId', 'clubName')
      .sort({ transferDate: -1 });

    res.json({
      player,
      transferHistory
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update player profile (Club only)
// @route   PUT /api/players/:playerId/profile
// @access  Private (Club only)
exports.updatePlayerProfile = async (req, res) => {
  try {
    if (req.user.role !== 'Club') {
      return res.status(403).json({ message: 'Only clubs can update player profiles' });
    }

    const { playerId } = req.params;
    const updates = req.body;

    // Find player
    const player = await Player.findById(playerId);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    // Verify player belongs to this club
    const club = await Club.findOne({ userId: req.user._id });
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    const isEnrolled = club.enrolledPlayers.some(
      id => id.toString() === playerId.toString()
    );

    if (!isEnrolled) {
      return res.status(403).json({ message: 'Player is not enrolled in your club' });
    }

    // Fields clubs can update
    const allowedUpdates = ['age', 'position', 'secondaryPosition', 'preferredFoot', 
                           'height', 'weight', 'videoUrl', 'bio', 'transferStatus'];
    
    const filteredUpdates = {};
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    const updatedPlayer = await Player.findByIdAndUpdate(
      playerId,
      { $set: filteredUpdates },
      { new: true, runValidators: true }
    );

    res.json(updatedPlayer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Release player from club
// @route   DELETE /api/players/:playerId/release
// @access  Private (Club Admin only)
exports.releasePlayer = async (req, res) => {
  try {
    const { playerId } = req.params;

    // Verify club exists and user is admin
    const club = await Club.findOne({ userId: req.user._id });
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    const user = await User.findById(req.user._id);
    if (user.clubRole !== 'Admin') {
      return res.status(403).json({ message: 'Only club admins can release players' });
    }

    // Find player
    const player = await Player.findById(playerId);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    // Verify player belongs to this club
    const isEnrolled = club.enrolledPlayers.some(
      id => id.toString() === playerId.toString()
    );

    if (!isEnrolled) {
      return res.status(403).json({ message: 'Player is not enrolled in your club' });
    }

    // Create transfer history record
    await TransferHistory.create({
      playerId: player._id,
      fromClubId: club._id,
      toClubId: null,
      initiatedBy: req.user._id,
      transferType: 'Permanent',
      notes: 'Player released from club',
    });

    // Remove player from club
    await Club.findByIdAndUpdate(club._id, {
      $pull: { enrolledPlayers: playerId }
    });

    // Update player
    await Player.findByIdAndUpdate(playerId, {
      clubId: null,
      joinedClubDate: null,
      transferStatus: 'Available'
    });

    res.json({ message: 'Player released successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};