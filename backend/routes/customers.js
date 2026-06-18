const express = require('express');
const router = express.Router();
const {
  createOrFindCustomer,
  getAllCustomers,
  getCustomerById,
} = require('../controllers/customersController');

router.post('/', createOrFindCustomer);

router.get('/', getAllCustomers);

router.get('/:id', getCustomerById);

module.exports = router;
