const { query } = require('../config/database');

// @desc    Get all assets for user
// @route   GET /api/v1/assets
// @access  Private
exports.getAll = async (req, res) => {
    try {
        const result = await query(
            `SELECT * FROM assets
             WHERE user_id = $1
             ORDER BY created_at DESC`,
            [req.user.id]
        );

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Get assets error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching assets',
            error: error.message
        });
    }
};

// @desc    Create new asset
// @route   POST /api/v1/assets
// @access  Private
exports.create = async (req, res) => {
    try {
        const { asset_name, asset_type, current_value, purchase_date, notes } = req.body;

        // Validation
        if (!asset_name || !asset_type || current_value === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Please provide asset_name, asset_type, and current_value'
            });
        }

        const result = await query(
            `INSERT INTO assets (user_id, asset_name, asset_type, current_value, purchase_date, notes)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [req.user.id, asset_name, asset_type, current_value, purchase_date || null, notes || null]
        );

        res.status(201).json({
            success: true,
            message: 'Asset created successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Create asset error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating asset',
            error: error.message
        });
    }
};

// @desc    Update asset
// @route   PUT /api/v1/assets/:id
// @access  Private
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { asset_name, asset_type, current_value, purchase_date, notes } = req.body;

        // Check if asset exists and belongs to user
        const existing = await query(
            'SELECT * FROM assets WHERE id = $1 AND user_id = $2',
            [id, req.user.id]
        );

        if (existing.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Asset not found'
            });
        }

        const result = await query(
            `UPDATE assets
             SET asset_name = COALESCE($1, asset_name),
                 asset_type = COALESCE($2, asset_type),
                 current_value = COALESCE($3, current_value),
                 purchase_date = COALESCE($4, purchase_date),
                 notes = COALESCE($5, notes),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $6 AND user_id = $7
             RETURNING *`,
            [asset_name, asset_type, current_value, purchase_date, notes, id, req.user.id]
        );

        res.json({
            success: true,
            message: 'Asset updated successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Update asset error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating asset',
            error: error.message
        });
    }
};

// @desc    Delete asset
// @route   DELETE /api/v1/assets/:id
// @access  Private
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await query(
            'DELETE FROM assets WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Asset not found'
            });
        }

        res.json({
            success: true,
            message: 'Asset deleted successfully'
        });
    } catch (error) {
        console.error('Delete asset error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting asset',
            error: error.message
        });
    }
};
