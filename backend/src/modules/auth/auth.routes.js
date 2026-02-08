// src/modules/auth/auth.routes.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const authController = require('./auth.controller');
const { requireAuth } = require('../../core/auth/auth.middleware');

const router = express.Router();

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      status: 'error',
      message: 'Validation failed',
      errors: errors.array() 
    });
  }
  next();
};

// Register
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('first_name').trim().notEmpty(),
  body('last_name').trim().notEmpty(),
], handleValidationErrors, authController.register);
//router.post('/register', handleValidationErrors, authController.register);

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], handleValidationErrors, authController.login);
//router.post('/login', handleValidationErrors, authController.login);


// Refresh token
router.post('/refresh', authController.refreshToken);

// Logout
router.post('/logout', requireAuth, authController.logout);

// Current user
router.get('/me', requireAuth, authController.getCurrentUser);

// Forgot password - request reset link
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail(),
], handleValidationErrors, authController.forgotPassword);

// Reset password - with token
router.post('/reset-password', [
  body('token').notEmpty(),
  body('new_password').isLength({ min: 8 }),
], handleValidationErrors, authController.resetPassword);

// Verify email
router.post('/verify-email', [
  body('token').notEmpty(),
], handleValidationErrors, authController.verifyEmail);

// Resend verification email
router.post('/resend-verification', [
  body('email').isEmail().normalizeEmail(),
], handleValidationErrors, authController.resendVerification);

module.exports = router;