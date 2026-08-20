const express = require('express');
const router = express.Router();
const { 
  upsertPlayerProfile, 
  getMyPlayerProfile, 
  searchPlayers, 
  getAvailablePlayers,
  getPlayerById,
  updatePlayerProfile,
  releasePlayer
} = require('../controllers/playerController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/profile', protect, authorize('Player'), upsertPlayerProfile);
router.get('/me', protect, authorize('Player'), getMyPlayerProfile);
router.get('/search', searchPlayers);
router.get('/available', protect, authorize('Club', 'Scout'), getAvailablePlayers);
router.get('/:id', getPlayerById);

// Club management of players
router.put('/:playerId/profile', protect, authorize('Club'), updatePlayerProfile);
router.delete('/:playerId/release', protect, authorize('Club'), releasePlayer);

module.exports = router;