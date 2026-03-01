// API service for Prescriptions
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

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

export interface Medication {
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  route?: string;
  instructions?: string;
  quantity?: string;
  refills_allowed?: number;
}

export interface PrescriptionPayload {
  medical_record_id?: string;
  appointment_id: string;
  pet_id: string;
  veterinarian_id?: string;
  valid_until?: string;
  notes?: string;
  medications: Medication[];
}

export interface PrescriptionDetail {
  id: string;
  medical_record_id?: string;
  appointment_id: string;
  pet_id: string;
  veterinarian_id?: string;
  valid_until?: string;
  notes?: string;
  medications: Medication[];
}

/**
 * Create a new prescription with medications
 */
export const savePrescription = async (
  _appointmentId: string,
  payload: PrescriptionPayload,
): Promise<any> => {
  const endpoint = `${API_BASE_URL}/api/medical-records/prescriptions`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`,
      );
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Update an existing prescription with medications (PATCH)
 */
export const updatePrescription = async (
  prescriptionId: string,
  medications: Medication[],
): Promise<any> => {
  const endpoint = `${API_BASE_URL}/api/medical-records/prescriptions/${prescriptionId}/medications`;

  try {
    const response = await fetch(endpoint, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ medications }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`,
      );
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Get prescription by ID
 */
export const getPrescriptionById = async (
  prescriptionId: string,
): Promise<PrescriptionDetail> => {
  if (!prescriptionId || prescriptionId.trim() === '') {
    throw new Error('Prescription ID is required');
  }

  const endpoint = `${API_BASE_URL}/api/medical-records/prescriptions/${prescriptionId}`;

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`,
      );
    }

    const data = await response.json();
    return data.data || data;
  } catch (error: any) {
    throw error;
  }
};
