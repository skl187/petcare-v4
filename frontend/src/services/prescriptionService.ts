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
  appointmentId: string,
  payload: PrescriptionPayload,
): Promise<any> => {
  console.log('🔵 savePrescription called');
  console.log('📦 Appointment ID:', appointmentId);
  console.log('📦 Payload:', JSON.stringify(payload, null, 2));

  const endpoint = `${API_BASE_URL}/api/medical-records/prescriptions`;
  console.log('📡 POST Endpoint:', endpoint);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Error response:', errorData);
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`,
      );
    }

    const data = await response.json();
    console.log('✅ Prescription saved successfully:', data);
    return data;
  } catch (error: any) {
    console.error('❌ Error saving prescription:', error);
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
  console.log('🔵 updatePrescription called');
  console.log('📦 Prescription ID:', prescriptionId);
  console.log('📦 Medications:', JSON.stringify(medications, null, 2));

  const endpoint = `${API_BASE_URL}/api/medical-records/prescriptions/${prescriptionId}/medications`;
  console.log('📡 PATCH Endpoint:', endpoint);

  try {
    const response = await fetch(endpoint, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ medications }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Error response:', errorData);
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`,
      );
    }

    const data = await response.json();
    console.log('✅ Prescription updated successfully:', data);
    return data;
  } catch (error: any) {
    console.error('❌ Error updating prescription:', error);
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
    console.error('❌ getPrescriptionById: Invalid prescription ID');
    throw new Error('Prescription ID is required');
  }

  console.log('🔵 getPrescriptionById called with ID:', prescriptionId);

  const endpoint = `${API_BASE_URL}/api/medical-records/prescriptions/${prescriptionId}`;
  console.log('📡 GET Endpoint:', endpoint);

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Error response:', errorData);
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`,
      );
    }

    const data = await response.json();
    console.log('✅ Prescription fetched successfully:', data);
    return data.data || data;
  } catch (error: any) {
    console.error('❌ Error fetching prescription:', error);
    throw error;
  }
};
