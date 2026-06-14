const express = require('express');
const router = express.Router();
const {
  getAllSlots,
  getSlotsByDate,
  createSlot,
  updateSlot,
  deleteSlot,
} = require('../controllers/slotsController');

// GET /api/slots        → all slots (or filtered by ?date=YYYY-MM-DD)
router.get('/', (req, res) => {
  if (req.query.date) return getSlotsByDate(req, res);
  return getAllSlots(req, res);
});

// POST /api/slots       → create slot
router.post('/', createSlot);

// PUT /api/slots/:id    → update slot
router.put('/:id', updateSlot);

// DELETE /api/slots/:id → delete slot
router.delete('/:id', deleteSlot);

module.exports = router;
