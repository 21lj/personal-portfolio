const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getConversation,
  getInbox,
  markAsRead,
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, sendMessage);
router.get('/inbox', protect, getInbox);
router.get('/conversation/:userId', protect, getConversation);
router.put('/:id/read', protect, markAsRead);

module.exports = router;