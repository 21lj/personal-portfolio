const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getMe, 
  updateAffiliation,
  requestScoutAffiliation,
  getScoutRequestStatus
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/affiliation', protect, updateAffiliation);
router.post('/scout-request', protect, requestScoutAffiliation);
router.get('/scout-request/status', protect, getScoutRequestStatus);

module.exports = router;