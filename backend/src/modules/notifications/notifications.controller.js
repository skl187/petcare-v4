const { query } = require('../../core/db/pool');
const { successResponse } = require('../../core/utils/response');

const listPending = async (req, res) => {
  try {
    const result = await query(
      `SELECT n.*, u.email, u.phone FROM notifications n LEFT JOIN users u ON n.user_id = u.id WHERE n.status = 'pending' ORDER BY scheduled_at ASC LIMIT 200`
    );
    res.json(successResponse(result.rows));
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch' });
  }
};

const getById = async (req, res) => {
  try {
    const result = await query(`SELECT * FROM notifications WHERE id = $1`, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ status: 'error', message: 'Not found' });
    res.json(successResponse(result.rows[0]));
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch' });
  }
};

const resend = async (req, res) => {
  try {
    // Mark notification as pending again and reset error/retry
    const result = await query(
      `UPDATE notifications SET status = 'pending', error = NULL, retry_count = 0 WHERE id = $1 RETURNING id`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ status: 'error', message: 'Not found' });
    res.json(successResponse(null, 'Scheduled for resend'));
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to resend' });
  }
};

module.exports = { listPending, getById, resend };
