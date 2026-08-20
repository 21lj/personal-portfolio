const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Club = require('../models/Club')
const ScoutRequest = require('../models/ScoutRequest')

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  })
}


exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body

    const userExists = await User.findOne({ email })
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'Player',
      isActive: true, // ➕ ADD THIS
      clubRole: 'Scout', // ➕ ADD THIS (default for scouts)
    })

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        isActive: user.isActive, // ➕ ADD THIS
        representedClubId: user.representedClubId,
        clubRole: user.clubRole, // ➕ ADD THIS
        token: generateToken(user._id),
      })
    } else {
      res.status(400).json({ message: 'Invalid user data' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email }).select('+password')

    if (user && (await bcrypt.compare(password, user.password))) {
      // ➕ ADD THIS CHECK
      if (!user.isActive) {
        return res.status(401).json({ message: 'Account is deactivated' })
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        isActive: user.isActive, // ➕ ADD THIS
        representedClubId: user.representedClubId,
        clubRole: user.clubRole, // ➕ ADD THIS
        token: generateToken(user._id),
      })
    } else {
      res.status(401).json({ message: 'Invalid credentials' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}



exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('representedClubId', 'clubName location').select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update scout's club affiliation (DEPRECATED - use scout-request instead)
// @route   PUT /api/auth/affiliation
// @access  Private (Scout only)
exports.updateAffiliation = async (req, res) => {
  try {
    const { clubId } = req.body;

    if (req.user.role !== 'Scout') {
      return res.status(403).json({ message: 'Only scouts can set club affiliation' });
    }

    if (!clubId) {
      return res.status(400).json({ message: 'Club ID is required' });
    }

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    // Check if scout already has a pending request
    const existingRequest = await ScoutRequest.findOne({
      scoutId: req.user._id,
      clubId: clubId,
      status: 'Pending'
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'You already have a pending request for this club' });
    }

    // Create scout request
    const scoutRequest = await ScoutRequest.create({
      scoutId: req.user._id,
      clubId: clubId,
      message: `Scout ${req.user.name} requests to join ${club.clubName}`,
    });

    // Update user's request status
    await User.findByIdAndUpdate(req.user._id, {
      scoutRequestStatus: 'Pending',
      scoutRequestedClubId: clubId
    });

    res.status(201).json({
      message: 'Scout request sent successfully. Waiting for club approval.',
      request: scoutRequest
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Scout requests to join a club
// @route   POST /api/auth/scout-request
// @access  Private (Scout only)
exports.requestScoutAffiliation = async (req, res) => {
  try {
    const { clubId, message } = req.body;

    if (req.user.role !== 'Scout') {
      return res.status(403).json({ message: 'Only scouts can request affiliation' });
    }

    if (!clubId) {
      return res.status(400).json({ message: 'Club ID is required' });
    }

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    // Check if scout already has a pending request
    const existingRequest = await ScoutRequest.findOne({
      scoutId: req.user._id,
      clubId: clubId,
      status: 'Pending'
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'You already have a pending request for this club' });
    }

    // Check if scout is already affiliated
    if (req.user.representedClubId) {
      return res.status(400).json({ message: 'You are already affiliated with a club' });
    }

    const scoutRequest = await ScoutRequest.create({
      scoutId: req.user._id,
      clubId: clubId,
      message: message || `Scout ${req.user.name} requests to join ${club.clubName}`,
    });

    await User.findByIdAndUpdate(req.user._id, {
      scoutRequestStatus: 'Pending',
      scoutRequestedClubId: clubId
    });

    res.status(201).json({
      message: 'Scout request sent successfully. Waiting for club approval.',
      request: scoutRequest
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get scout request status
// @route   GET /api/auth/scout-request/status
// @access  Private (Scout only)
exports.getScoutRequestStatus = async (req, res) => {
  try {
    if (req.user.role !== 'Scout') {
      return res.status(403).json({ message: 'Only scouts can view request status' });
    }

    const request = await ScoutRequest.findOne({
      scoutId: req.user._id
    })
    .populate('clubId', 'clubName location')
    .sort({ createdAt: -1 });

    if (!request) {
      return res.json({ 
        hasRequest: false,
        message: 'No scout request found' 
      });
    }

    res.json({
      hasRequest: true,
      status: request.status,
      club: request.clubId,
      message: request.message,
      createdAt: request.createdAt,
      respondedAt: request.respondedAt
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};