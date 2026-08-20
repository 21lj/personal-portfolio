const express = require('express');
const router = express.Router();
const {
  upsertClubProfile,
  getMyClubProfile,
  getClubById,
  getAllClubs,
  getClubScouts,
  removeScout,
  getScoutRequests,
  respondScoutRequest,
  getClubTransferHistory,
} = require('../controllers/clubController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/profile', protect, authorize('Club'), upsertClubProfile);
router.get('/me', protect, authorize('Club'), getMyClubProfile);
router.get('/:id', getClubById);
router.get('/', getAllClubs);

// Scout management
router.get('/scouts', protect, authorize('Club'), getClubScouts);
router.delete('/scouts/:scoutId', protect, authorize('Club'), removeScout);

// Scout requests
router.get('/scout-requests', protect, authorize('Club'), getScoutRequests);
router.put('/scout-requests/:requestId', protect, authorize('Club'), respondScoutRequest);

// Transfer history
router.get('/:clubId/transfers', protect, getClubTransferHistory);

module.exports = router;