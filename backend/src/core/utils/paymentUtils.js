/**
 * Payment Utility Functions
 * Handles split payment calculations, validation, and grouping
 */

/**
 * Calculate total paid amount across all split payments for an appointment
 * @param {Array} payments - Array of payment records
 * @returns {number} Total amount paid
 */
const calculateTotalPaid = (payments = []) => {
  return payments.reduce((sum, payment) => {
    if (payment.payment_status === 'paid' || payment.payment_status === 'partially_paid') {
      return sum + (parseFloat(payment.paid_amount) || 0);
    }
    return sum;
  }, 0);
};

/**
 * Calculate remaining balance for an appointment
 * @param {number} appointmentTotal - Total appointment amount
 * @param {Array} payments - Array of payment records
 * @returns {number} Remaining balance
 */
const calculateRemainingBalance = (appointmentTotal, payments = []) => {
  const totalPaid = calculateTotalPaid(payments);
  return Math.max(0, appointmentTotal - totalPaid);
};

/**
 * Validate split payment before recording
 * @param {Object} splitPayment - Payment object with appointment details
 * @param {number} splitPayment.appointmentTotal - Total appointment amount
 * @param {number} splitPayment.paymentAmount - Amount being paid now
 * @param {Array} splitPayment.existingPayments - Existing payment records
 * @param {string} splitPayment.paymentMethod - Type of payment
 * @param {string} splitPayment.splitPaymentGroupId - UUID for grouping related payments
 * @returns {Object} {isValid: boolean, error: string|null}
 */
const validateSplitPayment = ({
  appointmentTotal,
  paymentAmount,
  existingPayments = [],
  paymentMethod,
  splitPaymentGroupId
}) => {
  // Validate payment amount
  if (!paymentAmount || paymentAmount <= 0) {
    return { isValid: false, error: 'Payment amount must be greater than 0' };
  }

  // Check if already fully paid
  const totalPaid = calculateTotalPaid(existingPayments);
  if (totalPaid >= appointmentTotal) {
    return { isValid: false, error: 'Appointment is already fully paid' };
  }

  // Check if new payment exceeds remaining balance
  const remainingBalance = calculateRemainingBalance(appointmentTotal, existingPayments);
  if (paymentAmount > remainingBalance) {
    return { 
      isValid: false, 
      error: `Payment amount cannot exceed remaining balance of ${remainingBalance}` 
    };
  }

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
  if (!validMethods.includes(paymentMethod)) {
    return { isValid: false, error: `Invalid payment method: ${paymentMethod}` };
  }

  // Validate split payment group ID if multiple payments
  if (existingPayments.length > 0) {
    const hasSplitPayments = existingPayments.some(p => p.is_partial);
    if (hasSplitPayments && !splitPaymentGroupId) {
      return { isValid: false, error: 'Split payment group ID is required for multi-part payments' };
    }
  }

  return { isValid: true, error: null };
};

/**
 * Get split payment sequence number for new payment
 * @param {Array} existingPayments - Existing payment records for appointment
 * @param {string} splitPaymentGroupId - Group ID for split payments
 * @returns {number} Next sequence number
 */
const getNextPaymentSequence = (existingPayments = [], splitPaymentGroupId) => {
  if (!splitPaymentGroupId || existingPayments.length === 0) {
    return 1;
  }

  const groupPayments = existingPayments.filter(p => p.split_payment_group_id === splitPaymentGroupId);
  const maxSequence = Math.max(...groupPayments.map(p => p.payment_sequence || 0), 0);
  return maxSequence + 1;
};

/**
 * Group payments by split_payment_group_id
 * @param {Array} payments - Array of payment records
 * @returns {Object} Grouped payments {groupId: [payments]}
 */
const groupPaymentsBySplit = (payments = []) => {
  return payments.reduce((groups, payment) => {
    const groupId = payment.split_payment_group_id || payment.id;
    if (!groups[groupId]) {
      groups[groupId] = [];
    }
    groups[groupId].push(payment);
    return groups;
  }, {});
};

/**
 * Check if appointment is fully paid
 * @param {number} appointmentTotal - Total appointment amount
 * @param {Array} payments - Array of payment records
 * @returns {boolean}
 */
const isFullyPaid = (appointmentTotal, payments = []) => {
  const totalPaid = calculateTotalPaid(payments);
  return totalPaid >= appointmentTotal;
};

/**
 * Check if appointment has split payments
 * @param {Array} payments - Array of payment records
 * @returns {boolean}
 */
const hasSplitPayments = (payments = []) => {
  return payments.length > 1 || payments.some(p => p.is_partial);
};

/**
 * Get payment summary for appointment
 * @param {number} appointmentTotal - Total appointment amount
 * @param {Array} payments - Array of payment records
 * @returns {Object} Summary object
 */
const getPaymentSummary = (appointmentTotal, payments = []) => {
  const totalPaid = calculateTotalPaid(payments);
  const remainingBalance = calculateRemainingBalance(appointmentTotal, payments);
  const fullyPaid = isFullyPaid(appointmentTotal, payments);
  const isSplit = hasSplitPayments(payments);

  return {
    appointmentTotal: parseFloat(appointmentTotal),
    totalPaid: totalPaid,
    remainingBalance: remainingBalance,
    isFullyPaid: fullyPaid,
    isSplitPayment: isSplit,
    paymentCount: payments.length,
    paymentBreakdown: payments.map(p => ({
      method: p.payment_method,
      amount: parseFloat(p.paid_amount),
      status: p.payment_status,
      sequence: p.payment_sequence,
      date: p.payment_date
    }))
  };
};

module.exports = {
  calculateTotalPaid,
  calculateRemainingBalance,
  validateSplitPayment,
  getNextPaymentSequence,
  groupPaymentsBySplit,
  isFullyPaid,
  hasSplitPayments,
  getPaymentSummary
};
