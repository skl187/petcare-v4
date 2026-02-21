/**
 * Payment Input Validation Middleware
 * Validates payment request data before processing
 */

/**
 * Validate payment input from request body
 */
const validatePaymentInput = (req, res, next) => {
  const { payment_method, paid_amount, is_partial, split_payment_group_id } = req.body;

  // Validate payment method
  const validMethods = [
    'cash_at_counter',
    'credit_card',
    'debit_card',
    'upi',
    'bank_transfer',
    'cheque',
    'insurance',
    'wallet'
  ];

  if (!payment_method || !validMethods.includes(payment_method)) {
    return res.status(400).json({ 
      error: 'Invalid or missing payment_method. Must be one of: ' + validMethods.join(', ') 
    });
  }

  // Validate paid amount
  if (!paid_amount || isNaN(parseFloat(paid_amount))) {
    return res.status(400).json({ error: 'Invalid or missing paid_amount' });
  }

  const amount = parseFloat(paid_amount);
  if (amount <= 0) {
    return res.status(400).json({ error: 'paid_amount must be greater than 0' });
  }

  // Validate is_partial
  if (is_partial !== undefined && typeof is_partial !== 'boolean') {
    return res.status(400).json({ error: 'is_partial must be a boolean' });
  }

  // Validate split_payment_group_id format (UUID)
  if (split_payment_group_id) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(split_payment_group_id)) {
      return res.status(400).json({ 
        error: 'split_payment_group_id must be a valid UUID' 
      });
    }
  }

  next();
};

/**
 * Validate payment status update input
 */
const validatePaymentStatusUpdate = (req, res, next) => {
  const { payment_status } = req.body;

  const validStatuses = ['pending', 'paid', 'partially_paid', 'failed', 'cancelled'];

  if (!payment_status || !validStatuses.includes(payment_status)) {
    return res.status(400).json({ 
      error: 'Invalid or missing payment_status. Must be one of: ' + validStatuses.join(', ') 
    });
  }

  next();
};

/**
 * Validate provider transaction input
 */
const validateProviderTransaction = (req, res, next) => {
  const { provider_code, transaction_id, provider_response } = req.body;

  if (!provider_code) {
    return res.status(400).json({ error: 'Missing provider_code' });
  }

  const validProviders = ['stripe', 'razorpay', 'paypal', 'square', 'braintree'];
  if (!validProviders.includes(provider_code)) {
    return res.status(400).json({ 
      error: 'Invalid provider_code. Must be one of: ' + validProviders.join(', ') 
    });
  }

  if (!transaction_id) {
    return res.status(400).json({ error: 'Missing transaction_id' });
  }

  if (provider_response && typeof provider_response !== 'object') {
    return res.status(400).json({ error: 'provider_response must be a JSON object' });
  }

  next();
};

module.exports = {
  validatePaymentInput,
  validatePaymentStatusUpdate,
  validateProviderTransaction
};
