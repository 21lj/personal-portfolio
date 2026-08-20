const express = require('express');
const router = express.Router();
const {
  createOffer,
  getMyOffers,
  respondToOffer,
  getSentOffers,
  getOfferHistory,
  withdrawOffer,
} = require('../controllers/transferOfferController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Scouts send offers
router.post('/', protect, authorize('Scout'), createOffer);

// Players view their received offers
router.get('/my-offers', protect, authorize('Player'), getMyOffers);

// Players respond to offers
router.put('/:id/respond', protect, authorize('Player'), respondToOffer);

// Scouts view offers they sent
router.get('/sent', protect, authorize('Scout'), getSentOffers);

// Scouts view offer history
router.get('/history', protect, authorize('Scout'), getOfferHistory);

// Scouts withdraw offers
router.put('/:id/withdraw', protect, authorize('Scout'), withdrawOffer);

module.exports = router;