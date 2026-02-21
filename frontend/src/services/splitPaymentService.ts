/**
 * Split Payment Service
 * Frontend API service for split/partial payment operations
 */

import { API_ENDPOINTS } from '../constants/api';
import { getAuthHeaders } from '../utils/auth';

export interface PaymentPayload {
  payment_method: string;
  paid_amount: string | number;
  is_partial?: boolean;
  split_payment_group_id?: string;
  notes?: string;
  provider_code?: string;
  transaction_id?: string;
  provider_response?: Record<string, unknown>;
}

export interface PaymentResponse {
  id: string;
  appointment_id: string;
  user_id: string;
  payment_method: string;
  paid_amount: number;
  total_amount: number;
  payment_status: string;
  is_partial: boolean;
  payment_sequence?: number;
  split_payment_group_id?: string;
  payment_date: string;
  notes?: string;
}

export interface PaymentSummaryResponse {
  appointmentTotal: number;
  totalPaid: number;
  remainingBalance: number;
  isFullyPaid: boolean;
  isSplitPayment: boolean;
  paymentCount: number;
  paymentBreakdown: Array<{
    method: string;
    amount: number;
    status: string;
    sequence?: number;
    date?: string;
  }>;
}

/**
 * Record a new payment for an appointment
 */
export const recordPayment = async (
  appointmentId: string,
  paymentData: PaymentPayload
): Promise<PaymentResponse> => {
  const response = await fetch(
    API_ENDPOINTS.SPLIT_PAYMENTS.BASE(appointmentId),
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(paymentData),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to record payment');
  }

  const result = await response.json();
  return result.payment;
};

/**
 * Get all payments for an appointment
 */
export const getAppointmentPayments = async (
  appointmentId: string
): Promise<{ payments: PaymentResponse[]; summary: any }> => {
  const response = await fetch(
    API_ENDPOINTS.SPLIT_PAYMENTS.BASE(appointmentId),
    {
      method: 'GET',
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch payments');
  }

  const result = await response.json();
  return {
    payments: result.data,
    summary: result.summary,
  };
};

/**
 * Get payment summary for an appointment
 */
export const getPaymentSummary = async (
  appointmentId: string
): Promise<PaymentSummaryResponse> => {
  const response = await fetch(
    API_ENDPOINTS.SPLIT_PAYMENTS.SUMMARY(appointmentId),
    {
      method: 'GET',
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch payment summary');
  }

  const result = await response.json();
  return result.data;
};

/**
 * Update payment status
 */
export const updatePaymentStatus = async (
  appointmentId: string,
  paymentId: string,
  paymentStatus: string
): Promise<PaymentResponse> => {
  const response = await fetch(
    API_ENDPOINTS.SPLIT_PAYMENTS.DETAIL(appointmentId, paymentId),
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ payment_status: paymentStatus }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update payment');
  }

  const result = await response.json();
  return result.payment;
};

/**
 * Delete a payment
 */
export const deletePayment = async (
  appointmentId: string,
  paymentId: string
): Promise<{ message: string }> => {
  const response = await fetch(
    API_ENDPOINTS.SPLIT_PAYMENTS.DETAIL(appointmentId, paymentId),
    {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete payment');
  }

  const result = await response.json();
  return { message: result.message };
};

/**
 * Batch record multiple split payments
 */
export const recordSplitPayments = async (
  appointmentId: string,
  payments: PaymentPayload[]
): Promise<PaymentResponse[]> => {
  const recordedPayments: PaymentResponse[] = [];

  for (const payment of payments) {
    try {
      const recorded = await recordPayment(appointmentId, payment);
      recordedPayments.push(recorded);
    } catch (error) {
      // Rollback previous payments on error
      for (const recorded of recordedPayments) {
        try {
          await deletePayment(appointmentId, recorded.id);
        } catch (rollbackError) {
          console.error('Error rolling back payment:', rollbackError);
        }
      }
      throw error;
    }
  }

  return recordedPayments;
};

/**
 * Get payment statistics for a vet/clinic
 */
export const getPaymentStats = async (
  startDate: string,
  endDate: string,
  clinicId?: string
): Promise<{
  totalAmount: number;
  totalPaid: number;
  totalPending: number;
  splitPaymentCount: number;
  paymentMethodBreakdown: Record<string, number>;
}> => {
  const params = new URLSearchParams({
    startDate,
    endDate,
    ...(clinicId && { clinicId }),
  });

  const response = await fetch(
    `${API_ENDPOINTS.SPLIT_PAYMENTS.BASE('')}/statistics?${params}`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch payment statistics');
  }

  const result = await response.json();
  return result.data;
};

export default {
  recordPayment,
  getAppointmentPayments,
  getPaymentSummary,
  updatePaymentStatus,
  deletePayment,
  recordSplitPayments,
  getPaymentStats,
};
