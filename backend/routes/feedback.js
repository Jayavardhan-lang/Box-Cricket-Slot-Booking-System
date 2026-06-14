const express = require('express');
const router = express.Router();
const { createFeedback, getAllFeedback } = require('../controllers/feedbackController');

// POST /api/feedback   → submit feedback
router.post('/', createFeedback);

// GET  /api/feedback   → get all feedback with average rating
router.get('/', getAllFeedback);

module.exports = router;
