const { query } = require('../../core/db/pool');
const { successResponse } = require('../../core/utils/response');

const list = async (req, res) => {
  try {
    const result = await query(`SELECT * FROM notification_channels ORDER BY created_at DESC`);
    res.json(successResponse(result.rows));
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch channels' });
  }
};

const create = async (req, res) => {
  try {
    const { slug, name, provider, config, is_active } = req.body;
    if (!slug || !name) return res.status(400).json({ status: 'error', message: 'slug and name are required' });

    const result = await query(
      `INSERT INTO notification_channels (slug, name, provider, config, is_active, created_at)
       VALUES ($1,$2,$3,$4,$5,now()) RETURNING id, slug, name, provider, config, is_active, created_at`,
      [slug, name, provider || null, config || null, is_active === undefined ? true : is_active]
    );
    res.status(201).json(successResponse(result.rows[0], 'Created', 201));
  } catch (err) {
    res.status(500).json({ status: 'error', message: `Failed to create: ${err.message}` });
  }
};

const update = async (req, res) => {
  try {
    const { name, provider, config, is_active } = req.body;
    const result = await query(
      `UPDATE notification_channels
       SET name = COALESCE($2, name), provider = COALESCE($3, provider), config = COALESCE($4, config), is_active = COALESCE($5, is_active)
       WHERE slug = $1
       RETURNING id, slug, name, provider, config, is_active, updated_at`,
      [req.params.slug, name === undefined ? null : name, provider === undefined ? null : provider, config === undefined ? null : config, is_active === undefined ? null : is_active]
    );

    if (result.rows.length === 0) return res.status(404).json({ status: 'error', message: 'Not found' });
    res.json(successResponse(result.rows[0], 'Updated'));
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to update' });
  }
};

const remove = async (req, res) => {
  try {
    const result = await query(`DELETE FROM notification_channels WHERE slug = $1 RETURNING id`, [req.params.slug]);
    if (result.rows.length === 0) return res.status(404).json({ status: 'error', message: 'Not found' });
    res.json(successResponse(null, 'Deleted'));
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to delete' });
  }
};

module.exports = { list, create, update, delete: remove };
