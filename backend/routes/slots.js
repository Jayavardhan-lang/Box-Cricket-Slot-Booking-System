const express = require('express');
const router = express.Router();
const {
  getAllSlots,
  getSlotsByDate,
  createSlot,
  updateSlot,
  deleteSlot,
} = require('../controllers/slotsController');

router.get('/', (req, res) => {
  if (req.query.date) return getSlotsByDate(req, res);
  return getAllSlots(req, res);
});

router.post('/', createSlot);

router.put('/:id', updateSlot);

router.delete('/:id', deleteSlot);

module.exports = router;
