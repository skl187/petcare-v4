// API service for Lab Tests
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || '';

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
  _appointmentId: string,
  payload: LabTestPayload,
): Promise<any> => {
  const endpoint = `${API_BASE_URL}/api/medical-records/lab-tests`;

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
 * Update an existing lab test (PATCH)
 */
export const updateLabTest = async (
  labTestId: string,
  labTest: LabTest,
): Promise<any> => {
  const endpoint = `${API_BASE_URL}/api/medical-records/lab-tests/${labTestId}`;

  try {
    const response = await fetch(endpoint, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(labTest),
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
 * Get lab tests by medical record ID
 */
export const getLabTestsByMedicalRecordId = async (
  medicalRecordId: string,
): Promise<SingleLabTestResponse[]> => {
  if (!medicalRecordId || medicalRecordId.trim() === '') {
    throw new Error('Medical record ID is required');
  }

  const endpoint = `${API_BASE_URL}/api/medical-records/${medicalRecordId}/lab-tests`;

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

/**
 * Get lab test by ID (for single lab test details)
 */
export const getLabTestById = async (
  labTestId: string,
): Promise<SingleLabTestResponse> => {
  if (!labTestId || labTestId.trim() === '') {
    throw new Error('Lab test ID is required');
  }

  const endpoint = `${API_BASE_URL}/api/medical-records/lab-tests/${labTestId}`;

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
