const express = require('express');
const router = express.Router();
const {
  createFixture,
  updateFixture,
} = require('../controllers/tournamentsController');

// POST /api/fixtures      → create fixture
router.post('/', createFixture);

// PUT  /api/fixtures/:id  → update fixture result (auto-updates points table)
router.put('/:id', updateFixture);

module.exports = router;
