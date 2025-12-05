const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
    res.json({ success: true, message: 'List all' });
});

router.post('/', protect, async (req, res) => {
    res.json({ success: true, message: 'Create new' });
});

router.put('/:id', protect, async (req, res) => {
    res.json({ success: true, message: 'Update by ID' });
});

router.delete('/:id', protect, async (req, res) => {
    res.json({ success: true, message: 'Delete by ID' });
});

module.exports = router;
