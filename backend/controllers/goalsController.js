const { query } = require('../config/database');

// @desc    Get all goals for user
// @route   GET /api/v1/goals
// @access  Private
exports.getAll = async (req, res) => {
    try {
        const result = await query(
            `SELECT * FROM goals
             WHERE user_id = $1
             ORDER BY target_age ASC`,
            [req.user.id]
        );

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Get goals error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching goals',
            error: error.message
        });
    }
};

// @desc    Create new goal
// @route   POST /api/v1/goals
// @access  Private
exports.create = async (req, res) => {
    try {
        const { goal_name, target_amount, target_age, current_savings, priority, status, notes } = req.body;

        // Validation
        if (!goal_name || target_amount === undefined || target_age === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Please provide goal_name, target_amount, and target_age'
            });
        }

        const result = await query(
            `INSERT INTO goals (user_id, goal_name, target_amount, target_age, current_savings, priority, status, notes)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
            [
                req.user.id,
                goal_name,
                target_amount,
                target_age,
                current_savings || 0,
                priority || 'medium',
                status || 'pending',
                notes || null
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Goal created successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Create goal error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating goal',
            error: error.message
        });
    }
};

// @desc    Update goal
// @route   PUT /api/v1/goals/:id
// @access  Private
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { goal_name, target_amount, target_age, current_savings, priority, status, notes } = req.body;

        // Check if goal exists and belongs to user
        const existing = await query(
            'SELECT * FROM goals WHERE id = $1 AND user_id = $2',
            [id, req.user.id]
        );

        if (existing.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Goal not found'
            });
        }

        const result = await query(
            `UPDATE goals
             SET goal_name = COALESCE($1, goal_name),
                 target_amount = COALESCE($2, target_amount),
                 target_age = COALESCE($3, target_age),
                 current_savings = COALESCE($4, current_savings),
                 priority = COALESCE($5, priority),
                 status = COALESCE($6, status),
                 notes = COALESCE($7, notes),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $8 AND user_id = $9
             RETURNING *`,
            [goal_name, target_amount, target_age, current_savings, priority, status, notes, id, req.user.id]
        );

        res.json({
            success: true,
            message: 'Goal updated successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Update goal error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating goal',
            error: error.message
        });
    }
};

// @desc    Delete goal
// @route   DELETE /api/v1/goals/:id
// @access  Private
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await query(
            'DELETE FROM goals WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Goal not found'
            });
        }

        res.json({
            success: true,
            message: 'Goal deleted successfully'
        });
    } catch (error) {
        console.error('Delete goal error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting goal',
            error: error.message
        });
    }
};
