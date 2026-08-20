const express = require('express');
const router = express.Router();
const { analyzePlayerPerformance } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/analyze-player/:playerId', protect, analyzePlayerPerformance);

module.exports = router;