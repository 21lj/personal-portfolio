const Club = require('../models/Club');
const Player = require('../models/Player');
const User = require('../models/User');
const ScoutRequest = require('../models/ScoutRequest');
const TransferHistory = require('../models/TransferHistory');
const TransferOffer = require('../models/TransferOffer');

// @desc    Create or update club profile
// @route   POST /api/clubs/profile
// @access  Private (Club only)
exports.upsertClubProfile = async (req, res) => {
  try {
    const { clubName, location, description } = req.body;

    if (req.user.role !== 'Club') {
      return res.status(403).json({ message: 'Only club officials can create a club profile' });
    }

    const profileFields = {
      userId: req.user._id,
      clubName,
      location,
      description: description || '',
    };

    let club = await Club.findOne({ userId: req.user._id });

    if (club) {
      club = await Club.findOneAndUpdate(
        { userId: req.user._id },
        { $set: profileFields },
        { new: true }
      );
      return res.json(club);
    }

    // Create club and auto-assign creator as admin
    club = await Club.create(profileFields);
    
    // Add creator as club admin in scouts array
    await Club.findByIdAndUpdate(club._id, {
      $addToSet: { scouts: req.user._id }
    });

    // Update user's club role to Admin
    await User.findByIdAndUpdate(req.user._id, {
      clubRole: 'Admin'
    });

    res.status(201).json(club);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged-in club's profile with enrolled players
// @route   GET /api/clubs/me
// @access  Private (Club only)
exports.getMyClubProfile = async (req, res) => {
  try {
    if (req.user.role !== 'Club') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const club = await Club.findOne({ userId: req.user._id })
      .populate('enrolledPlayers', 'age position preferredFoot height weight videoUrl bio transferStatus')
      .populate('scouts', 'name email isVerified');

    if (!club) {
      return res.status(404).json({ message: 'Club profile not found' });
    }

    res.json(club);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get club by ID
// @route   GET /api/clubs/:id
// @access  Public
exports.getClubById = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id)
      .populate('enrolledPlayers', 'age position preferredFoot height weight videoUrl bio transferStatus')
      .populate('scouts', 'name email isVerified');

    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    res.json(club);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all clubs
// @route   GET /api/clubs
// @access  Public
exports.getAllClubs = async (req, res) => {
  try {
    const clubs = await Club.find()
      .select('clubName location description enrolledPlayers scouts isVerified')
      .populate('enrolledPlayers', 'age position')
      .populate('scouts', 'name');
    res.json(clubs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get scouts in my club
// @route   GET /api/clubs/scouts
// @access  Private (Club Admin only)
exports.getClubScouts = async (req, res) => {
  try {
    const club = await Club.findOne({ userId: req.user._id });
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    // Check if user is club admin
    const user = await User.findById(req.user._id);
    if (user.clubRole !== 'Admin') {
      return res.status(403).json({ message: 'Only club admins can view scouts' });
    }

    const scouts = await User.find({
      _id: { $in: club.scouts },
      role: 'Scout'
    }).select('name email isVerified clubRole');

    res.json(scouts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove scout from club
// @route   DELETE /api/clubs/scouts/:scoutId
// @access  Private (Club Admin only)
exports.removeScout = async (req, res) => {
  try {
    const { scoutId } = req.params;

    // Verify club exists and user is admin
    const club = await Club.findOne({ userId: req.user._id });
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    const user = await User.findById(req.user._id);
    if (user.clubRole !== 'Admin') {
      return res.status(403).json({ message: 'Only club admins can remove scouts' });
    }

    // Can't remove self
    if (scoutId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot remove yourself from the club' });
    }

    // Remove scout from club
    await Club.findByIdAndUpdate(club._id, {
      $pull: { scouts: scoutId }
    });

    // Update scout's affiliation
    await User.findByIdAndUpdate(scoutId, {
      representedClubId: null,
      clubRole: 'Scout'
    });

    res.json({ message: 'Scout removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get scout requests for my club
// @route   GET /api/clubs/scout-requests
// @access  Private (Club Admin only)
exports.getScoutRequests = async (req, res) => {
  try {
    const club = await Club.findOne({ userId: req.user._id });
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    const user = await User.findById(req.user._id);
    if (user.clubRole !== 'Admin') {
      return res.status(403).json({ message: 'Only club admins can view scout requests' });
    }

    const requests = await ScoutRequest.find({
      clubId: club._id,
      status: 'Pending'
    }).populate('scoutId', 'name email');

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Respond to scout request
// @route   PUT /api/clubs/scout-requests/:requestId
// @access  Private (Club Admin only)
exports.respondScoutRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body; // 'Approved' or 'Rejected'

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be Approved or Rejected' });
    }

    const club = await Club.findOne({ userId: req.user._id });
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    const user = await User.findById(req.user._id);
    if (user.clubRole !== 'Admin') {
      return res.status(403).json({ message: 'Only club admins can respond to requests' });
    }

    const request = await ScoutRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.clubId.toString() !== club._id.toString()) {
      return res.status(403).json({ message: 'Request does not belong to your club' });
    }

    if (request.status !== 'Pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }

    request.status = status;
    request.respondedBy = req.user._id;
    request.respondedAt = new Date();
    await request.save();

    if (status === 'Approved') {
      // Add scout to club
      await Club.findByIdAndUpdate(club._id, {
        $addToSet: { scouts: request.scoutId }
      });

      // Update scout's affiliation
      await User.findByIdAndUpdate(request.scoutId, {
        representedClubId: club._id,
        clubRole: 'Scout',
        scoutRequestStatus: 'Approved'
      });

      res.json({ 
        message: 'Scout request approved successfully', 
        scoutId: request.scoutId 
      });
    } else {
      await User.findByIdAndUpdate(request.scoutId, {
        representedClubId: null,
        scoutRequestStatus: 'Rejected'
      });

      res.json({ message: 'Scout request rejected' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get transfer history for a club
// @route   GET /api/clubs/:clubId/transfers
// @access  Private
exports.getClubTransferHistory = async (req, res) => {
  try {
    const { clubId } = req.params;

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    // Only allow if user is affiliated with the club or is admin
    const isAffiliated = club.scouts.includes(req.user._id) || 
                        club.userId.toString() === req.user._id.toString();
    
    if (!isAffiliated && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to view this club\'s transfers' });
    }

    const transfers = await TransferHistory.find({
      $or: [
        { fromClubId: clubId },
        { toClubId: clubId }
      ]
    })
    .populate('playerId', 'age position')
    .populate('initiatedBy', 'name')
    .sort({ transferDate: -1 });

    res.json(transfers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};