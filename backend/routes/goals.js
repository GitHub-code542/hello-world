const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getAll,
    create,
    update,
    delete: deleteGoal
} = require('../controllers/goalsController');

router.get('/', protect, getAll);
router.post('/', protect, create);
router.put('/:id', protect, update);
router.delete('/:id', protect, deleteGoal);

module.exports = router;
