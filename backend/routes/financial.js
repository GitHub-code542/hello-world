const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// All financial data endpoints
router.get('/', protect, async (req, res) => {
    res.json({ success: true, message: 'Get all financial data' });
});

router.post('/', protect, async (req, res) => {
    res.json({ success: true, message: 'Add financial data' });
});

module.exports = router;
