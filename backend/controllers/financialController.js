const { query } = require('../config/database');

// @desc    Get all financial data for user
// @route   GET /api/v1/financial
// @access  Private
exports.getAll = async (req, res) => {
    try {
        const result = await query(
            `SELECT * FROM financial_data
             WHERE user_id = $1
             ORDER BY created_at DESC`,
            [req.user.id]
        );

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Get financial data error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching financial data',
            error: error.message
        });
    }
};

// @desc    Save financial data (batch create/update)
// @route   POST /api/v1/financial
// @access  Private
exports.save = async (req, res) => {
    try {
        const financialData = req.body;

        if (!Array.isArray(financialData)) {
            return res.status(400).json({
                success: false,
                message: 'Expected array of financial data'
            });
        }

        // Delete existing data for this user
        await query('DELETE FROM financial_data WHERE user_id = $1', [req.user.id]);

        // Insert new data
        const insertPromises = financialData.map(item => {
            return query(
                `INSERT INTO financial_data (user_id, category, amount, data_type)
                 VALUES ($1, $2, $3, $4)
                 RETURNING *`,
                [req.user.id, item.category, item.amount, item.data_type]
            );
        });

        const results = await Promise.all(insertPromises);
        const savedData = results.map(r => r.rows[0]);

        res.json({
            success: true,
            message: 'Financial data saved successfully',
            data: savedData
        });
    } catch (error) {
        console.error('Save financial data error:', error);
        res.status(500).json({
            success: false,
            message: 'Error saving financial data',
            error: error.message
        });
    }
};

// @desc    Update single financial data entry
// @route   PUT /api/v1/financial/:id
// @access  Private
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { category, amount, data_type } = req.body;

        // Check if entry exists and belongs to user
        const existing = await query(
            'SELECT * FROM financial_data WHERE id = $1 AND user_id = $2',
            [id, req.user.id]
        );

        if (existing.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Financial data entry not found'
            });
        }

        const result = await query(
            `UPDATE financial_data
             SET category = COALESCE($1, category),
                 amount = COALESCE($2, amount),
                 data_type = COALESCE($3, data_type),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $4 AND user_id = $5
             RETURNING *`,
            [category, amount, data_type, id, req.user.id]
        );

        res.json({
            success: true,
            message: 'Financial data updated successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Update financial data error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating financial data',
            error: error.message
        });
    }
};

// @desc    Delete financial data entry
// @route   DELETE /api/v1/financial/:id
// @access  Private
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await query(
            'DELETE FROM financial_data WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Financial data entry not found'
            });
        }

        res.json({
            success: true,
            message: 'Financial data deleted successfully'
        });
    } catch (error) {
        console.error('Delete financial data error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting financial data',
            error: error.message
        });
    }
};
