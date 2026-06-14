const express = require('express');
const router = express.Router();
const {
  createMembership,
  getAllMemberships,
  getMembershipById,
  updateMembership,
} = require('../controllers/membershipsController');

// POST /api/memberships      → create membership
router.post('/', createMembership);

// GET  /api/memberships      → get all memberships
router.get('/', getAllMemberships);

// GET  /api/memberships/:id  → get membership by id
router.get('/:id', getMembershipById);

// PUT  /api/memberships/:id  → update membership status
router.put('/:id', updateMembership);

module.exports = router;
