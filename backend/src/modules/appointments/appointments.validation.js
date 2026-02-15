// src/modules/appointments/appointments.validation.js
// ============================================================================
// Validation Schemas for Appointments
// ============================================================================

const { body, param, query, validationResult } = require('express-validator');

// ============================================================================
// CUSTOM VALIDATORS
// ============================================================================

const validateAppointmentDate = (value) => {
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date format');
  }
  if (date < new Date()) {
    throw new Error('Appointment date must be in the future');
  }
  return true;
};

const validatePaymentType = (value) => {
  if (!['online', 'cash', 'insurance'].includes(value)) {
    throw new Error('Payment type must be online, cash, or insurance');
  }
  return true;
};

const validateAppointmentStatus = (value) => {
  const validStatuses = ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show', 'rescheduled'];
  if (!validStatuses.includes(value)) {
    throw new Error(`Status must be one of: ${validStatuses.join(', ')}`);
  }
  return true;
};

// ============================================================================
// VALIDATION MIDDLEWARE
// ============================================================================

const validateCreateAppointment = [
  body('user_id')
    .optional()
    .isUUID('4').withMessage('Invalid user ID format'),
  body('pet_id')
    .isUUID('4').withMessage('Invalid pet ID format'),
  body('veterinarian_id')
    .isUUID('4').withMessage('Invalid veterinarian ID format'),
  body('clinic_id')
    .isUUID('4').withMessage('Invalid clinic ID format'),
  body('appointment_date')
    .custom(validateAppointmentDate),
  body('appointment_time')
    .matches(/^\d{2}:\d{2}$/).withMessage('Time format must be HH:MM'),
  body('appointment_type')
    .optional()
    .isIn(['consultation', 'checkup', 'vaccination', 'surgery', 'emergency', 'followup', 'telemedicine'])
    .withMessage('Invalid appointment type'),
  body('priority')
    .optional()
    .isIn(['normal', 'urgent', 'emergency'])
    .withMessage('Invalid priority'),
  body('chief_complaint')
    .optional()
    .isString().trim(),
  body('service_ids')
    .optional()
    .isArray().withMessage('Service IDs must be an array')
    .custom((services) => services.every(id => typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)))
    .withMessage('All service IDs must be valid UUIDs'),
  body('payment_info.payment_type')
    .optional()
    .custom(validatePaymentType),
  body('payment_info.method')
    .optional()
    .isIn(['card', 'upi', 'wallet', 'cheque', 'bank_transfer'])
    .withMessage('Invalid payment method'),
  body('payment_info.amount_to_pay')
    .optional()
    .isFloat({ min: 0 }).withMessage('Amount must be positive'),
];

const validateUpdateAppointmentStatus = [
  param('id')
    .isUUID('4').withMessage('Invalid appointment ID format'),
  body('status')
    .custom(validateAppointmentStatus),
  body('notes')
    .optional()
    .isString().trim()
];

const validateProcessPayment = [
  param('appointmentId')
    .isUUID('4').withMessage('Invalid appointment ID format'),
  body('payment_type')
    .custom(validatePaymentType),
  body('method')
    .optional()
    .isIn(['card', 'upi', 'wallet', 'cheque', 'bank_transfer', 'insurance'])
    .withMessage('Invalid payment method'),
  body('amount')
    .optional()
    .isFloat({ min: 0 }).withMessage('Amount must be positive'),
  body('status')
    .optional()
    .isIn(['pending', 'completed', 'failed', 'cancelled'])
    .withMessage('Invalid transaction status')
];

const validateRescheduleAppointment = [
  param('id')
    .isUUID('4').withMessage('Invalid appointment ID format'),
  body('new_date')
    .custom(validateAppointmentDate),
  body('new_time')
    .matches(/^\d{2}:\d{2}$/).withMessage('Time format must be HH:MM'),
  body('reason')
    .optional()
    .isString().trim()
];

const validateListAppointments = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .custom(validateAppointmentStatus),
  query('user_id')
    .optional()
    .isUUID('4').withMessage('Invalid user ID format'),
  query('veterinarian_id')
    .optional()
    .isUUID('4').withMessage('Invalid veterinarian ID format'),
  query('clinic_id')
    .optional()
    .isUUID('4').withMessage('Invalid clinic ID format'),
  query('date_from')
    .optional()
    .isISO8601().withMessage('Invalid date format'),
  query('date_to')
    .optional()
    .isISO8601().withMessage('Invalid date format')
];

// ============================================================================
// VALIDATION ERROR HANDLER
// ============================================================================

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        param: err.param,
        msg: err.msg
      }))
    });
  }
  next();
};

module.exports = {
  validateCreateAppointment,
  validateUpdateAppointmentStatus,
  validateProcessPayment,
  validateRescheduleAppointment,
  validateListAppointments,
  handleValidationErrors
};