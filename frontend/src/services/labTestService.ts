// API service for Lab Tests
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

export interface LabTest {
  test_name: string;
  test_type: string;
  lab_name?: string;
  urgency: 'routine' | 'urgent' | 'stat';
  cost?: number;
  normal_range?: string;
}

export interface LabTestPayload {
  medical_record_id?: string;
  appointment_id: string;
  pet_id: string;
  lab_tests: LabTest[];
}

// Response from GET single lab test endpoint
export interface SingleLabTestResponse {
  id: string;
  medical_record_id?: string;
  appointment_id: string;
  pet_id: string;
  test_name: string;
  test_type: string;
  lab_name?: string;
  urgency: 'routine' | 'urgent' | 'stat';
  cost?: number;
  normal_range?: string;
}

// For displaying lab tests in the UI
export interface LabTestDetail {
  id: string;
  medical_record_id?: string;
  appointment_id: string;
  pet_id: string;
  lab_tests: LabTest[];
}

/**
 * Create a new lab test order
 */
export const saveLabTest = async (
  appointmentId: string,
  payload: LabTestPayload,
): Promise<any> => {
  console.log('🔵 saveLabTest called');
  console.log('📦 Appointment ID:', appointmentId);
  console.log('📦 Payload:', JSON.stringify(payload, null, 2));

  const endpoint = `${API_BASE_URL}/api/medical-records/lab-tests`;
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
    console.log('✅ Lab test saved successfully:', data);
    return data;
  } catch (error: any) {
    console.error('❌ Error saving lab test:', error);
    throw error;
  }
};

/**
 * Update an existing lab test (PATCH)
 */
export const updateLabTest = async (
  labTestId: string,
  labTest: LabTest,
): Promise<any> => {
  console.log('🔵 updateLabTest called');
  console.log('📦 Lab Test ID:', labTestId);
  console.log('📦 Lab Test Data:', JSON.stringify(labTest, null, 2));

  const endpoint = `${API_BASE_URL}/api/medical-records/lab-tests/${labTestId}`;
  console.log('📡 PATCH Endpoint:', endpoint);

  try {
    const response = await fetch(endpoint, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(labTest),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Error response:', errorData);
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`,
      );
    }

    const data = await response.json();
    console.log('✅ Lab test updated successfully:', data);
    return data;
  } catch (error: any) {
    console.error('❌ Error updating lab test:', error);
    throw error;
  }
};

/**
 * Get lab tests by medical record ID
 */
export const getLabTestsByMedicalRecordId = async (
  medicalRecordId: string,
): Promise<SingleLabTestResponse[]> => {
  if (!medicalRecordId || medicalRecordId.trim() === '') {
    console.error('❌ getLabTestsByMedicalRecordId: Invalid medical record ID');
    throw new Error('Medical record ID is required');
  }

  console.log(
    '🔵 getLabTestsByMedicalRecordId called with ID:',
    medicalRecordId,
  );

  const endpoint = `${API_BASE_URL}/api/medical-records/${medicalRecordId}/lab-tests`;
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
    console.log('✅ Lab tests fetched successfully:', data);
    return data.data || data;
  } catch (error: any) {
    console.error('❌ Error fetching lab tests:', error);
    throw error;
  }
};

/**
 * Get lab test by ID (for single lab test details)
 */
export const getLabTestById = async (
  labTestId: string,
): Promise<SingleLabTestResponse> => {
  if (!labTestId || labTestId.trim() === '') {
    console.error('❌ getLabTestById: Invalid lab test ID');
    throw new Error('Lab test ID is required');
  }

  console.log('🔵 getLabTestById called with ID:', labTestId);

  const endpoint = `${API_BASE_URL}/api/medical-records/lab-tests/${labTestId}`;
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
    console.log('✅ Lab test fetched successfully:', data);
    return data.data || data;
  } catch (error: any) {
    console.error('❌ Error fetching lab test:', error);
    throw error;
  }
};
