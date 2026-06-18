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

router.get('/', getAllTournaments);

router.post('/', createTournament);

router.put('/:id', updateTournament);

router.post('/:id/register', registerTeam);

router.get('/:id/registrations', getRegistrations);

router.get('/:id/fixtures', getFixtures);

router.get('/:id/points', getPointsTable);

module.exports = router;
