const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// @route   GET /api/v1/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
    // TODO: Implement in userController
    res.json({ success: true, message: 'Get profile endpoint' });
});

// @route   PUT /api/v1/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
    // TODO: Implement in userController
    res.json({ success: true, message: 'Update profile endpoint' });
});

module.exports = router;
