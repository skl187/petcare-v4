// Payment Service - API calls for payment management

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export interface Payment {
  id: string;
  appointment_id: string;
  user_id: string;
  payment_method: 'cash' | 'card' | 'online' | 'cheque';
  transaction_id: string | null;
  consultation_fee: string;
  other_charges: string;
  subtotal: string;
  discount_amount: string;
  tax_amount: string;
  total_amount: string;
  paid_amount: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'cancelled';
  payment_date: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  clinic_id: string;
  appointment_date: string;
  appointment_status: string;
}

/** Admin payment — extends Payment with joined owner / pet / vet / clinic data */
export interface AdminPayment extends Payment {
  owner_first_name: string;
  owner_last_name: string;
  owner_email: string;
  pet_name: string;
  vet_first_name: string;
  vet_last_name: string;
  clinic_name: string;
  appointment_time: string;
}

/** Owner/user payment — extends Payment with joined pet / vet / clinic data */
export interface UserPayment extends Payment {
  pet_name: string;
  vet_first_name: string;
  vet_last_name: string;
  clinic_name: string;
  appointment_time: string;
}

export interface PaymentResponse {
  status: string;
  message: string;
  data: Payment[];
  timestamp: string;
}

const getAuthHeaders = () => {
  const token = sessionStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

/**
 * Fetch all vet payments
 */
export const getVetPayments = async (): Promise<Payment[]> => {
  try {
    const url = `${API_BASE_URL}/api/payments/vet`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch payments: ${response.statusText}`);
    }

    const result: PaymentResponse = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching payments:', error);
    throw error;
  }
};

/**
 * Admin — fetch all payments across all vets
 */
export const getAllPayments = async (): Promise<AdminPayment[]> => {
  const url = `${API_BASE_URL}/api/payments/all`;
  const response = await fetch(url, { method: 'GET', headers: getAuthHeaders() });
  if (!response.ok) throw new Error(`Failed to fetch payments: ${response.statusText}`);
  const result = await response.json();
  return result.data || [];
};

/**
 * Owner — fetch own payments
 */
export const getUserPayments = async (): Promise<UserPayment[]> => {
  const url = `${API_BASE_URL}/api/payments/user`;
  const response = await fetch(url, { method: 'GET', headers: getAuthHeaders() });
  if (!response.ok) throw new Error(`Failed to fetch payments: ${response.statusText}`);
  const result = await response.json();
  return result.data || [];
};

/**
 * Update payment status
 */
export const updatePaymentStatus = async (
  paymentId: string,
  status: 'pending' | 'completed' | 'failed' | 'cancelled',
): Promise<Payment> => {
  try {
    const url = `${API_BASE_URL}/api/payments/${paymentId}`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ payment_status: status }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update payment: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error updating payment:', error);
    throw error;
  }
};
