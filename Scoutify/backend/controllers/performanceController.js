
const Performance = require('../models/Performance');
const Player = require('../models/Player');
const Club = require('../models/Club');

// @desc    Log match performance stats for a player
// @route   POST /api/performance
// @access  Private (Club & Admin only)
exports.addPerformance = async (req, res) => {
  try {
    // Role gate
    if (!['Club', 'Admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized to log performance data' });
    }

    const { playerId, matchName, goals, assists, passingAccuracy, dribbles, rating } = req.body;

    const playerExists = await Player.findById(playerId);
    if (!playerExists) {
      return res.status(404).json({ message: 'Player not found' });
    }

    // If Club user, ensure player is enrolled in their club
    if (req.user.role === 'Club') {
      const club = await Club.findOne({ userId: req.user._id });
      if (!club || !club.enrolledPlayers.map(id => id.toString()).includes(playerId)) {
        return res.status(403).json({ message: 'You can only log performance for players enrolled in your club' });
      }
    }

    const performance = await Performance.create({
      playerId,
      matchName,
      goals,
      assists,
      passingAccuracy,
      dribbles,
      rating,
      createdBy: req.user._id,
    });

    res.status(201).json(performance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get performance history of a specific player
// @route   GET /api/performance/player/:playerId
// @access  Public / Private
exports.getPlayerPerformance = async (req, res) => {
  try {
    const performances = await Performance.find({ playerId: req.params.playerId })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(performances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update performance record
// @route   PUT /api/performance/:id
// @access  Private (Club & Admin only)
exports.updatePerformance = async (req, res) => {
  try {
    if (!['Club', 'Admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized to update performance data' });
    }

    const performance = await Performance.findById(req.params.id);
    if (!performance) {
      return res.status(404).json({ message: 'Performance record not found' });
    }

    // If Club user, verify player belongs to their club
    if (req.user.role === 'Club') {
      const club = await Club.findOne({ userId: req.user._id });
      const player = await Player.findById(performance.playerId);
      
      if (!club || !player || !club.enrolledPlayers.includes(player._id)) {
        return res.status(403).json({ message: 'Not authorized to update this performance record' });
      }
    }

    const allowedUpdates = ['goals', 'assists', 'passingAccuracy', 'dribbles', 'rating', 'minutesPlayed'];
    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    updates.updatedBy = req.user._id;
    updates.isEdited = true;

    const updatedPerformance = await Performance.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json(updatedPerformance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete performance record
// @route   DELETE /api/performance/:id
// @access  Private (Club & Admin only)
exports.deletePerformance = async (req, res) => {
  try {
    if (!['Club', 'Admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized to delete performance data' });
    }

    const performance = await Performance.findById(req.params.id);
    if (!performance) {
      return res.status(404).json({ message: 'Performance record not found' });
    }

    // If Club user, verify player belongs to their club
    if (req.user.role === 'Club') {
      const club = await Club.findOne({ userId: req.user._id });
      const player = await Player.findById(performance.playerId);
      
      if (!club || !player || !club.enrolledPlayers.includes(player._id)) {
        return res.status(403).json({ message: 'Not authorized to delete this performance record' });
      }
    }

    await Performance.findByIdAndDelete(req.params.id);
    res.json({ message: 'Performance record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};