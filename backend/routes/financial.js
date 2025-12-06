const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getAll,
    save,
    update,
    delete: deleteFinancial
} = require('../controllers/financialController');

// All financial data endpoints
router.get('/', protect, getAll);
router.post('/', protect, save);
router.put('/:id', protect, update);
router.delete('/:id', protect, deleteFinancial);

module.exports = router;
