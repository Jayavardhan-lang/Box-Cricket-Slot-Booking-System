const express = require('express');
const router = express.Router();
const {
  getAllTournaments,
  createTournament,
  updateTournament,
  registerTeam,
  getRegistrations,
  getFixtures,
  getPointsTable,
} = require('../controllers/tournamentsController');

// GET  /api/tournaments                         → all tournaments
router.get('/', getAllTournaments);

// POST /api/tournaments                         → create tournament
router.post('/', createTournament);

// PUT  /api/tournaments/:id                     → update tournament
router.put('/:id', updateTournament);

// POST /api/tournaments/:id/register            → register team
router.post('/:id/register', registerTeam);

// GET  /api/tournaments/:id/registrations       → get registrations
router.get('/:id/registrations', getRegistrations);

// GET  /api/tournaments/:id/fixtures            → get fixtures
router.get('/:id/fixtures', getFixtures);

// GET  /api/tournaments/:id/points              → get points table
router.get('/:id/points', getPointsTable);

module.exports = router;
