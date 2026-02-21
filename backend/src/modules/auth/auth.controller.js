// src/modules/auth/auth.controller.js
const { query, transaction } = require('../../core/db/pool');
const { generateToken } = require('../../core/auth/jwt.service');
const { hashPassword, comparePassword } = require('../../core/auth/password.service');
const { successResponse } = require('../../core/utils/response');
//for reset password and email verification
const crypto = require('crypto');
const { sendVerificationEmail } = require('../../core/email/email.service');
const { NODE_ENV } = require('../../config/env');

const register = async (req, res) => {
  try {
    const { email, password, first_name, last_name, user_type } = req.body;

    // Check if user exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ 
        status: 'error',
        message: 'Email already registered' 
      });
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Create user within transaction
    const result = await transaction(async (client) => {
      // Insert user - auto-verify in development so we can work without email sending
      const isVerified = NODE_ENV === 'development';
      const userResult = await client.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, display_name, status, is_email_verified)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, email, first_name, last_name, display_name`,
        [email, password_hash, first_name, last_name, `${first_name} ${last_name}`, 'pending', isVerified]
      );

      const user = userResult.rows[0];

     const roleSlug = (typeof user_type === 'string' && user_type.trim()) ? user_type.trim() : 'owner';
 
     // Find role and assign it to the created user
     const roleResult = await client.query(
       'SELECT id FROM roles WHERE slug = $1',
       [roleSlug]
     );
 
     // Fallback to 'owner' if requested role doesn't exist
     let roleId = null;
     if (roleResult.rows.length === 0 && roleSlug !== 'owner') {
       const ownerResult = await client.query('SELECT id FROM roles WHERE slug = $1', ['owner']);
       if (ownerResult.rows.length > 0) roleId = ownerResult.rows[0].id;
     } else if (roleResult.rows.length > 0) {
       roleId = roleResult.rows[0].id;
     }
 
     if (roleId) {
       await client.query(
         'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)',
         [user.id, roleId]
       );
    }

      let verificationToken = null;
      // Generate email verification token only if we didn't auto-verify
      if (!isVerified) {
        verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenHash = crypto.createHash('sha256').update(verificationToken).digest('hex');
        const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        await client.query(
          `INSERT INTO email_verifications (user_id, token, token_hash, expires_at, request_ip)
           VALUES ($1, $2, $3, $4, $5)`,
          [user.id, verificationToken, verificationTokenHash, verificationExpiresAt, req.ip || null]
        );
      }

      return { user, verificationToken };
    });

    // Log audit
    //req.auditLog('register', 'user', { email });

    // Send verification email unless we auto-verified in development
    if (NODE_ENV !== 'development') {
      try {
        await sendVerificationEmail(result.user.email, result.verificationToken, result.user.first_name);
      } catch (emailErr) {
        console.error('Failed to send verification email:', emailErr);
        // Don't fail registration if email fails
      }
    } else {
      console.log('Development mode - skipping verification email');
    }

    // Generate token
    const token = generateToken({
      id: result.user.id,
      email: result.user.email,
      role: 'owner'
    });

    res.status(201).json({
      ...successResponse({
        user: result.user,
        token,
        message: NODE_ENV === 'development'
          ? 'Registration successful. (Email verification skipped in development.)'
          : 'Registration successful. Please check your email to verify your account.'
      })
    });

  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ 
      status: 'error',
      message: 'Registration failed' 
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Get user with roles
    const result = await query(
      `SELECT u.id, u.email, u.password_hash, u.first_name, u.last_name, u.status, u.is_email_verified,
              array_agg(DISTINCT r.slug) as roles
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.id
       WHERE u.email = $1 AND u.deleted_at IS NULL
       GROUP BY u.id, u.email, u.password_hash, u.first_name, u.last_name, u.status, u.is_email_verified`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        status: 'error',
        message: 'Invalid credentials' 
      });
    }

    const user = result.rows[0];

    // Check status
    if (user.status !== 'active') {
      return res.status(403).json({
        status: 'error',
        message: `Account is ${user.status}`
      });
    }

    // Check email verification
    if (!user.is_email_verified) {
      return res.status(403).json({
        status: 'error',
        message: 'Please verify your email address before signing in',
        code: 'EMAIL_NOT_VERIFIED'
      });
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ 
        status: 'error',
        message: 'Invalid credentials' 
      });
    }

    // Update last login
    await query(
      'UPDATE users SET last_login_at = now() WHERE id = $1',
      [user.id]
    );

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      roles: user.roles.filter(r => r !== null)
    });

    // Log audit
    //req.auditLog('login', 'user', { email });

    res.json(successResponse({
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        roles: user.roles.filter(r => r !== null)
      },
      token
    }, 'Login successful'));

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      status: 'error',
      message: 'Login failed' 
    });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const result = await query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.avatar_url,
              array_agg(DISTINCT r.slug) as roles
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.id
       WHERE u.id = $1
       GROUP BY u.id, u.email, u.first_name, u.last_name, u.avatar_url`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        status: 'error',
        message: 'User not found' 
      });
    }

    res.json(successResponse(result.rows[0]));

  } catch (err) {
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to fetch user' 
    });
  }
};

const refreshToken = (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Token required' 
      });
    }

    const { decodeToken } = require('../../core/auth/jwt.service');
    const decoded = decodeToken(token);

    const newToken = generateToken({
      id: decoded.id,
      email: decoded.email,
      roles: decoded.roles
    });

    res.json(successResponse({ token: newToken }, 'Token refreshed'));

  } catch (err) {
    res.status(401).json({ 
      status: 'error',
      message: 'Invalid token' 
    });
  }
};

const logout = async (req, res) => {
  try {
    req.auditLog('logout', 'user', {});
    res.json(successResponse(null, 'Logged out successfully'));
  } catch (err) {
    res.status(500).json({ 
      status: 'error',
      message: 'Logout failed' 
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    //console.log('[auth] forgot-password request for:', email);

    const userResult = await query(
      'SELECT id, email, first_name FROM users WHERE email = $1 AND deleted_at IS NULL',
      [email]
    );

    if (userResult.rows.length === 0) {
      // Do not reveal existence
      return res.json(successResponse(null, 'If email exists, reset link will be sent'));
    }

    const user = userResult.rows[0];
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    await query(
      `INSERT INTO password_resets (user_id, token, token_hash, expires_at, request_ip)
       VALUES ($1, $2, $3, $4, $5)`,
      [user.id, resetToken, tokenHash, expiresAt, req.ip || null]
    );

    //console.log('[auth] password_resets inserted for user', user.id);

    // TODO: send email with resetUrl
    // const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    // await sendResetEmail(user.email, resetUrl, user.first_name);

    // For testing in non-prod return token
    if (process.env.NODE_ENV !== 'production') {
      return res.json(successResponse({ debug: { resetToken } }, 'If email exists, reset link will be sent'));
    }

    return res.json(successResponse(null, 'If email exists, reset link will be sent'));
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ status: 'error', message: 'Forgot password failed' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, new_password } = req.body;
    if (!token || !new_password) {
      return res.status(400).json({ status: 'error', message: 'Token and new_password required' });
    }

    // Debug: log incoming token (server only)
    //console.log('[auth] resetPassword received token:', token);

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    //console.log('[auth] computed tokenHash:', tokenHash);

    const resetResult = await query(
      `SELECT id, user_id FROM password_resets 
       WHERE token_hash = $1 AND expires_at > NOW() AND used = FALSE`,
      [tokenHash]
    );

    // If not found, perform a debug lookup (helps identify encoding/column mismatch)
    if (resetResult.rows.length === 0) {
      const debugRows = (await query(
        `SELECT id, user_id, token, token_hash, used, expires_at, created_at
         FROM password_resets
         WHERE token = $1 OR token_hash = $2
         ORDER BY created_at DESC
         LIMIT 5`,
        [token, tokenHash]
      )).rows;

      console.log('[auth] resetPassword debug rows:', debugRows);

      // In non-prod return debug details to client for faster debugging
      if (process.env.NODE_ENV !== 'production') {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid or expired reset token',
          debug: debugRows
        });
      }

      return res.status(400).json({ status: 'error', message: 'Invalid or expired reset token' });
    }

    // ...existing code continues unchanged...
    const resetRow = resetResult.rows[0];
    const passwordHash = await hashPassword(new_password);

    await transaction(async (client) => {
      await client.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [
        passwordHash,
        resetRow.user_id
      ]);

      await client.query('UPDATE password_resets SET used = TRUE, consumed_at = NOW() WHERE id = $1', [
        resetRow.id
      ]);
    });

    return res.json(successResponse(null, 'Password reset successful. You can now login.'));
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ status: 'error', message: 'Reset password failed' });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        status: 'error',
        message: 'Verification token is required'
      });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const verifyResult = await query(
      `SELECT id, user_id FROM email_verifications
       WHERE token_hash = $1 AND expires_at > NOW() AND used = FALSE`,
      [tokenHash]
    );

    if (verifyResult.rows.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired verification token'
      });
    }

    const verification = verifyResult.rows[0];

    await transaction(async (client) => {
      // Mark user as verified and activate account
      await client.query(
        `UPDATE users
         SET is_email_verified = TRUE, status = 'active', updated_at = NOW()
         WHERE id = $1`,
        [verification.user_id]
      );

      // Mark token as used
      await client.query(
        `UPDATE email_verifications
         SET used = TRUE, verified_at = NOW()
         WHERE id = $1`,
        [verification.id]
      );
    });

    return res.json(successResponse(null, 'Email verified successfully. You can now sign in.'));

  } catch (err) {
    console.error('Email verification error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Email verification failed'
    });
  }
};

const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    const userResult = await query(
      `SELECT id, email, first_name, is_email_verified
       FROM users
       WHERE email = $1 AND deleted_at IS NULL`,
      [email]
    );

    // Don't reveal if user exists
    if (userResult.rows.length === 0) {
      return res.json(successResponse(null, 'If the email exists, a verification link will be sent'));
    }

    const user = userResult.rows[0];

    if (user.is_email_verified) {
      return res.json(successResponse(null, 'Email is already verified'));
    }

    // Invalidate previous tokens
    await query(
      `UPDATE email_verifications SET used = TRUE WHERE user_id = $1 AND used = FALSE`,
      [user.id]
    );

    // Generate new token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenHash = crypto.createHash('sha256').update(verificationToken).digest('hex');
    const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await query(
      `INSERT INTO email_verifications (user_id, token, token_hash, expires_at, request_ip)
       VALUES ($1, $2, $3, $4, $5)`,
      [user.id, verificationToken, verificationTokenHash, verificationExpiresAt, req.ip || null]
    );

    try {
      await sendVerificationEmail(user.email, verificationToken, user.first_name);
    } catch (emailErr) {
      console.error('Failed to send verification email:', emailErr);
    }

    // For testing in non-prod
    if (process.env.NODE_ENV !== 'production') {
      return res.json(successResponse(
        { debug: { verificationToken } },
        'If the email exists, a verification link will be sent'
      ));
    }

    return res.json(successResponse(null, 'If the email exists, a verification link will be sent'));

  } catch (err) {
    console.error('Resend verification error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to resend verification email'
    });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification
};