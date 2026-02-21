/**
 * Frontend Payment Utility Functions
 * Handles split payment calculations, formatting, and validation on client side
 */

export interface Payment {
  id?: string;
  appointment_id?: string;
  user_id?: string;
  payment_method: string;
  paid_amount: number | string;
  total_amount?: number | string;
  payment_status: 'pending' | 'paid' | 'partially_paid' | 'failed' | 'cancelled';
  is_partial?: boolean;
  payment_sequence?: number;
  split_payment_group_id?: string;
  payment_date?: string;
}

export interface PaymentSummary {
  appointmentTotal: number;
  totalPaid: number;
  remainingBalance: number;
  isFullyPaid: boolean;
  isSplitPayment: boolean;
  paymentCount: number;
  paymentBreakdown: PaymentBreakdown[];
}

export interface PaymentBreakdown {
  method: string;
  amount: number;
  status: string;
  sequence?: number;
  date?: string;
}

/**
 * Calculate total paid amount across all split payments
 */
export const calculateTotalPaid = (payments: Payment[] = []): number => {
  return payments.reduce((sum, payment) => {
    if (payment.payment_status === 'paid' || payment.payment_status === 'partially_paid') {
      return sum + (parseFloat(String(payment.paid_amount)) || 0);
    }
    return sum;
  }, 0);
};

/**
 * Calculate remaining balance for an appointment
 */
export const calculateRemainingBalance = (
  appointmentTotal: number | string,
  payments: Payment[] = []
): number => {
  const total = parseFloat(String(appointmentTotal));
  const totalPaid = calculateTotalPaid(payments);
  return Math.max(0, total - totalPaid);
};

/**
 * Format currency amount
 */
export const formatCurrency = (amount: number | string, currency: string = 'USD'): string => {
  const num = parseFloat(String(amount));
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(num);
};

/**
 * Check if appointment is fully paid
 */
export const isFullyPaid = (appointmentTotal: number | string, payments: Payment[] = []): boolean => {
  const total = parseFloat(String(appointmentTotal));
  const totalPaid = calculateTotalPaid(payments);
  return totalPaid >= total;
};

/**
 * Check if appointment has split payments
 */
export const hasSplitPayments = (payments: Payment[] = []): boolean => {
  return payments.length > 1 || payments.some(p => p.is_partial);
};

/**
 * Get payment summary for appointment
 */
export const getPaymentSummary = (
  appointmentTotal: number | string,
  payments: Payment[] = []
): PaymentSummary => {
  const total = parseFloat(String(appointmentTotal));
  const totalPaid = calculateTotalPaid(payments);
  const remainingBalance = calculateRemainingBalance(total, payments);
  const fullyPaid = isFullyPaid(total, payments);
  const isSplit = hasSplitPayments(payments);

  return {
    appointmentTotal: total,
    totalPaid: totalPaid,
    remainingBalance: remainingBalance,
    isFullyPaid: fullyPaid,
    isSplitPayment: isSplit,
    paymentCount: payments.length,
    paymentBreakdown: payments.map(p => ({
      method: p.payment_method,
      amount: parseFloat(String(p.paid_amount)),
      status: p.payment_status,
      sequence: p.payment_sequence,
      date: p.payment_date
    }))
  };
};

/**
 * Group payments by split_payment_group_id
 */
export const groupPaymentsBySplit = (
  payments: Payment[] = []
): Record<string, Payment[]> => {
  return payments.reduce((groups, payment) => {
    const groupId = payment.split_payment_group_id || payment.id || 'single';
    if (!groups[groupId]) {
      groups[groupId] = [];
    }
    groups[groupId].push(payment);
    return groups;
  }, {} as Record<string, Payment[]>);
};

/**
 * Validate split payment amount before submission
 */
export const validateSplitPaymentAmount = (
  paymentAmount: number | string,
  remainingBalance: number
): { isValid: boolean; error?: string } => {
  const amount = parseFloat(String(paymentAmount));

  if (!amount || amount <= 0) {
    return { isValid: false, error: 'Payment amount must be greater than 0' };
  }

  if (amount > remainingBalance) {
    return {
      isValid: false,
      error: `Payment cannot exceed remaining balance of ${formatCurrency(remainingBalance)}`
    };
  }

  return { isValid: true };
};

/**
 * Get payment status badge color
 */
export const getPaymentStatusColor = (status: string): string => {
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-800';
    case 'partially_paid':
      return 'bg-yellow-100 text-yellow-800';
    case 'pending':
      return 'bg-blue-100 text-blue-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    case 'cancelled':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Get payment method display name
 */
export const getPaymentMethodDisplay = (method: string): string => {
  const displayMap: Record<string, string> = {
    'cash_at_counter': 'Cash',
    'credit_card': 'Credit Card',
    'debit_card': 'Debit Card',
    'upi': 'UPI',
    'bank_transfer': 'Bank Transfer',
    'cheque': 'Cheque',
    'insurance': 'Insurance',
    'wallet': 'Digital Wallet'
  };

  return displayMap[method] || method;
};

/**
 * Get payment method icon (for UI)
 */
export const getPaymentMethodIcon = (method: string): string => {
  const iconMap: Record<string, string> = {
    'cash_at_counter': '💵',
    'credit_card': '💳',
    'debit_card': '💳',
    'upi': '📱',
    'bank_transfer': '🏦',
    'cheque': '📄',
    'insurance': '🛡️',
    'wallet': '👛'
  };

  return iconMap[method] || '💰';
};

/**
 * Format payment breakdown for display
 */
export const formatPaymentBreakdown = (summary: PaymentSummary): string[] => {
  const lines: string[] = [];

  lines.push(`Total Amount: ${formatCurrency(summary.appointmentTotal)}`);
  lines.push(`Amount Paid: ${formatCurrency(summary.totalPaid)}`);

  if (!summary.isFullyPaid) {
    lines.push(`Remaining Balance: ${formatCurrency(summary.remainingBalance)}`);
  }

  if (summary.isSplitPayment) {
    lines.push(`Payment Method Split: ${summary.paymentCount} payments`);
    summary.paymentBreakdown.forEach((breakdown, index) => {
      lines.push(
        `  ${index + 1}. ${getPaymentMethodDisplay(breakdown.method)}: ${formatCurrency(breakdown.amount)}`
      );
    });
  }

  return lines;
};

/**
 * Generate split payment group ID (UUID v4)
 */
export const generateSplitPaymentGroupId = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Check if payment data is valid
 */
export const isValidPayment = (payment: Partial<Payment>): boolean => {
  return !!(
    payment.appointment_id &&
    payment.payment_method &&
    payment.paid_amount &&
    parseFloat(String(payment.paid_amount)) > 0 &&
    payment.payment_status
  );
};

export default {
  calculateTotalPaid,
  calculateRemainingBalance,
  formatCurrency,
  isFullyPaid,
  hasSplitPayments,
  getPaymentSummary,
  groupPaymentsBySplit,
  validateSplitPaymentAmount,
  getPaymentStatusColor,
  getPaymentMethodDisplay,
  getPaymentMethodIcon,
  formatPaymentBreakdown,
  generateSplitPaymentGroupId,
  isValidPayment
};
