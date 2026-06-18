const express = require('express');
const router = express.Router();
const {
  createFixture,
  updateFixture,
} = require('../controllers/tournamentsController');

router.post('/', createFixture);

router.put('/:id', updateFixture);

module.exports = router;
