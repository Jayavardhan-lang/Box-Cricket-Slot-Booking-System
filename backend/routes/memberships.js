const express = require('express');
const router = express.Router();
const {
  createMembership,
  getAllMemberships,
  getMembershipById,
  updateMembership,
} = require('../controllers/membershipsController');

router.post('/', createMembership);

router.get('/', getAllMemberships);

router.get('/:id', getMembershipById);

router.put('/:id', updateMembership);

module.exports = router;
