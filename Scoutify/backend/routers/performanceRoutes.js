const express = require('express');
const router = express.Router();
const { addPerformance, getPlayerPerformance, updatePerformance, deletePerformance } = require('../controllers/performanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Only Clubs and Admins can log performance stats
router.post('/', protect, authorize('Club', 'Admin'), addPerformance);

// Anyone logged in can fetch performance stats for a player
router.get('/player/:playerId', protect, getPlayerPerformance);

// Update performance (Club only)
router.put('/:id', protect, authorize('Club', 'Admin'), updatePerformance);

// Delete performance (Club only)
router.delete('/:id', protect, authorize('Club', 'Admin'), deletePerformance);

module.exports = router;