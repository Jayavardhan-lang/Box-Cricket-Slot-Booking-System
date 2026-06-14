const express = require('express');
const router = express.Router();
const {
  createOrFindCustomer,
  getAllCustomers,
  getCustomerById,
} = require('../controllers/customersController');

// POST /api/customers      → create or find customer by phone
router.post('/', createOrFindCustomer);

// GET  /api/customers      → get all customers
router.get('/', getAllCustomers);

// GET  /api/customers/:id  → get customer by id
router.get('/:id', getCustomerById);

module.exports = router;
