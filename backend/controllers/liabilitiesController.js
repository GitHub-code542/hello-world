const { query } = require('../config/database');

// @desc    Get all liabilities for user
// @route   GET /api/v1/liabilities
// @access  Private
exports.getAll = async (req, res) => {
    try {
        const result = await query(
            `SELECT * FROM liabilities
             WHERE user_id = $1
             ORDER BY created_at DESC`,
            [req.user.id]
        );

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Get liabilities error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching liabilities',
            error: error.message
        });
    }
};

// @desc    Create new liability
// @route   POST /api/v1/liabilities
// @access  Private
exports.create = async (req, res) => {
    try {
        const { liability_name, liability_type, current_balance, interest_rate, monthly_payment, notes } = req.body;

        // Validation
        if (!liability_name || !liability_type || current_balance === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Please provide liability_name, liability_type, and current_balance'
            });
        }

        const result = await query(
            `INSERT INTO liabilities (user_id, liability_name, liability_type, current_balance, interest_rate, monthly_payment, notes)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [req.user.id, liability_name, liability_type, current_balance, interest_rate || null, monthly_payment || null, notes || null]
        );

        res.status(201).json({
            success: true,
            message: 'Liability created successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Create liability error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating liability',
            error: error.message
        });
    }
};

// @desc    Update liability
// @route   PUT /api/v1/liabilities/:id
// @access  Private
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { liability_name, liability_type, current_balance, interest_rate, monthly_payment, notes } = req.body;

        // Check if liability exists and belongs to user
        const existing = await query(
            'SELECT * FROM liabilities WHERE id = $1 AND user_id = $2',
            [id, req.user.id]
        );

        if (existing.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Liability not found'
            });
        }

        const result = await query(
            `UPDATE liabilities
             SET liability_name = COALESCE($1, liability_name),
                 liability_type = COALESCE($2, liability_type),
                 current_balance = COALESCE($3, current_balance),
                 interest_rate = COALESCE($4, interest_rate),
                 monthly_payment = COALESCE($5, monthly_payment),
                 notes = COALESCE($6, notes),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $7 AND user_id = $8
             RETURNING *`,
            [liability_name, liability_type, current_balance, interest_rate, monthly_payment, notes, id, req.user.id]
        );

        res.json({
            success: true,
            message: 'Liability updated successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Update liability error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating liability',
            error: error.message
        });
    }
};

// @desc    Delete liability
// @route   DELETE /api/v1/liabilities/:id
// @access  Private
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await query(
            'DELETE FROM liabilities WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Liability not found'
            });
        }

        res.json({
            success: true,
            message: 'Liability deleted successfully'
        });
    } catch (error) {
        console.error('Delete liability error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting liability',
            error: error.message
        });
    }
};
