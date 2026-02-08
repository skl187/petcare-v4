// src/modules/users/user_addresses.controller.js
const { query, transaction } = require('../../core/db/pool');
const { successResponse } = require('../../core/utils/response');

// List addresses for a user
const listAddresses = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT id, type, label, address_line1, address_line2, city, state, postal_code, country, latitude, longitude, is_primary, created_at
       FROM user_addresses
       WHERE user_id = $1 AND deleted_at IS NULL
       ORDER BY is_primary DESC, created_at DESC`,
      [id]
    );

    res.json(successResponse(result.rows));
  } catch (err) {
    console.error('List addresses error:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to fetch addresses' });
  }
};

// Create address for a user
const createAddress = async (req, res) => {
  try {
    const { id } = req.params; // user id
    const {
      type = 'home', label, address_line1, address_line2, city, state, postal_code, country, latitude, longitude, is_primary = false
    } = req.body;

    // Basic validation handled at route level
    const result = await transaction(async (client) => {
      if (is_primary) {
        await client.query('UPDATE user_addresses SET is_primary = false WHERE user_id = $1 AND deleted_at IS NULL', [id]);
      }

      const insertResult = await client.query(
        `INSERT INTO user_addresses
         (user_id, type, label, address_line1, address_line2, city, state, postal_code, country, latitude, longitude, is_primary)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         RETURNING id, type, label, address_line1, address_line2, city, state, postal_code, country, latitude, longitude, is_primary, created_at`,
        [id, type, label, address_line1, address_line2, city, state, postal_code, country, latitude, longitude, is_primary]
      );

      return insertResult.rows[0];
    });

    res.status(201).json(successResponse(result, 'Address created', 201));
  } catch (err) {
    console.error('Create address error:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to create address' });
  }
};

// Update address
const updateAddress = async (req, res) => {
  try {
    const { id, addressId } = req.params;
    const fields = ['type','label','address_line1','address_line2','city','state','postal_code','country','latitude','longitude','is_primary'];
    const updates = [];
    const params = [addressId, id];
    let idx = 3; // param index starts at $3

    for (const f of fields) {
      if (req.body[f] !== undefined) {
        updates.push(`${f} = $${idx}`);
        params.push(req.body[f]);
        idx++;
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ status: 'error', message: 'No updatable fields provided' });
    }

    const result = await transaction(async (client) => {
      // If setting primary, unset others
      if (req.body.is_primary === true) {
        await client.query('UPDATE user_addresses SET is_primary = false WHERE user_id = $1 AND deleted_at IS NULL', [id]);
      }

      const q = `UPDATE user_addresses SET ${updates.join(', ')} WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL RETURNING id, type, label, address_line1, address_line2, city, state, postal_code, country, latitude, longitude, is_primary, created_at, updated_at`;
      const r = await client.query(q, params);
      return r.rows[0];
    });

    if (!result) {
      return res.status(404).json({ status: 'error', message: 'Address not found' });
    }

    res.json(successResponse(result, 'Address updated successfully'));
  } catch (err) {
    console.error('Update address error:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to update address' });
  }
};

// Soft delete address
const deleteAddress = async (req, res) => {
  try {
    const { id, addressId } = req.params;

    const result = await query('UPDATE user_addresses SET deleted_at = now() WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL RETURNING id', [addressId, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Address not found' });
    }

    res.json(successResponse(null, 'Address deleted successfully'));
  } catch (err) {
    console.error('Delete address error:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to delete address' });
  }
};

module.exports = {
  listAddresses,
  createAddress,
  updateAddress,
  deleteAddress
};
