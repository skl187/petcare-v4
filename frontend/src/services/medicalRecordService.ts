// API service for Medical Records
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export interface MedicalRecordPayload {
  appointment_id: string;
  pet_id: string;
  record_type: 'consultation' | 'checkup' | 'emergency' | 'surgery';
  diagnosis: string;
  symptoms: Record<string, string | number>;
  vital_signs: Record<string, string | number>;
  physical_examination: string;
  treatment_plan: string;
  recommendations: string;
  followup_required: boolean;
  followup_date?: string;
  notes?: string;
  is_confidential?: boolean;
}

export interface MedicalRecordResponse {
  status: string;
  message: string;
  data: {
    id: string;
    record_type: string;
    record_date: string;
  };
}

export interface MedicalRecordDetail {
  id: string;
  appointment_id: string;
  pet_id: string;
  veterinarian_id: string;
  record_type: 'consultation' | 'checkup' | 'emergency' | 'surgery';
  record_date: string;
  diagnosis: string;
  symptoms: Record<string, string | number>;
  vital_signs: Record<string, string | number>;
  physical_examination: string;
  treatment_plan: string;
  recommendations: string;
  followup_required: boolean;
  followup_date?: string;
  notes?: string;
  is_confidential: boolean;
  created_at: string;
  updated_at: string;
}

const getAuthToken = (): string | null => {
  return sessionStorage.getItem('token');
};

const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

/**
 * Save/Create a medical record
 */
export const saveMedicalRecord = async (
  payload: MedicalRecordPayload,
): Promise<MedicalRecordResponse> => {
  try {
    // Use the correct endpoint: /api/appointments/vet/{appointmentId}/medical-record
    const appointmentId = payload.appointment_id;
    const response = await fetch(
      `${API_BASE_URL}/api/appointments/vet/${appointmentId}/medical-record`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to save medical record');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get medical record by ID
 */
export const getMedicalRecordById = async (
  recordId: string,
): Promise<MedicalRecordDetail> => {
  console.log('🔴 getMedicalRecordById CALLED with ID:', recordId);

  if (!recordId) {
    console.error('❌ recordId is empty or null');
    throw new Error('recordId is required');
  }

  try {
    const endpoint = `${API_BASE_URL}/api/medical-records/records/${recordId}`;
    console.log('🟡 Calling endpoint:', endpoint);

    const headers = getAuthHeaders();
    console.log('📋 Headers:', headers);

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: headers,
    });

    console.log('📊 Response status:', response.status);
    const data = await response.json();
    console.log('📦 Response data:', data);

    if (!response.ok) {
      throw new Error(data.message || `Failed with status ${response.status}`);
    }

    const result = data.data || data;
    console.log('✅ Successfully loaded medical record');
    return result;
  } catch (error) {
    console.error('🔴 ERROR in getMedicalRecordById:', error);
    throw error;
  }
};

/**
 * Get all medical records for an appointment
 */
export const getMedicalRecordsByAppointment = async (
  appointmentId: string,
): Promise<MedicalRecordDetail[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/medical-records/appointment/${appointmentId}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch medical records');
    }

    return data.data || [];
  } catch (error) {
    throw error;
  }
};

/**
 * Update a medical record
 */
export const updateMedicalRecord = async (
  recordId: string,
  payload: Partial<MedicalRecordPayload>,
): Promise<MedicalRecordResponse> => {
  try {
    // Use the correct endpoint for update
    const appointmentId = payload.appointment_id;
    const response = await fetch(
      `${API_BASE_URL}/api/appointments/vet/${appointmentId}/medical-record/${recordId}`,
      {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update medical record');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a medical record
 */
export const deleteMedicalRecord = async (
  recordId: string,
): Promise<{ status: string; message: string }> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/medical-records/records/${recordId}`,
      {
        method: 'DELETE',
        headers: getAuthHeaders(),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete medical record');
    }

    return data;
  } catch (error) {
    throw error;
  }
};
