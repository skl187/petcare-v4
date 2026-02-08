// API service for Vaccinations
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

export interface Vaccination {
  vaccine_name: string;
  vaccine_type: string;
  manufacturer?: string;
  batch_number?: string;
  site_of_injection?: string;
  next_due_date?: string;
  cost?: number;
  notes?: string;
}

export interface VaccinationPayload {
  medical_record_id?: string;
  appointment_id: string;
  pet_id: string;
  veterinarian_id?: string;
  vaccinations: Vaccination[];
}

export interface VaccinationDetail {
  id: string;
  medical_record_id?: string;
  appointment_id: string;
  pet_id: string;
  veterinarian_id?: string;
  vaccinations: Vaccination[];
}

/**
 * Create a new vaccination record with multiple vaccinations
 */
export const saveVaccination = async (
  appointmentId: string,
  payload: VaccinationPayload,
): Promise<any> => {
  console.log('🔵 saveVaccination called');
  console.log('📦 Appointment ID:', appointmentId);
  console.log('📦 Payload:', JSON.stringify(payload, null, 2));

  const endpoint = `${API_BASE_URL}/api/medical-records/vaccinations`;
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
    console.log('✅ Vaccination saved successfully:', data);
    return data;
  } catch (error: any) {
    console.error('❌ Error saving vaccination:', error);
    throw error;
  }
};

/**
 * Update an existing vaccination record with single vaccination (PATCH)
 */
export const updateVaccination = async (
  vaccinationId: string,
  vaccination: Vaccination,
): Promise<any> => {
  console.log('🔵 updateVaccination called');
  console.log('📦 Vaccination ID:', vaccinationId);
  console.log('📦 Vaccination:', JSON.stringify(vaccination, null, 2));

  const endpoint = `${API_BASE_URL}/api/medical-records/vaccinations/${vaccinationId}`;
  console.log('📡 PATCH Endpoint:', endpoint);

  try {
    const response = await fetch(endpoint, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(vaccination),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Error response:', errorData);
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`,
      );
    }

    const data = await response.json();
    console.log('✅ Vaccination updated successfully:', data);
    return data;
  } catch (error: any) {
    console.error('❌ Error updating vaccination:', error);
    throw error;
  }
};

/**
 * Get vaccination record by ID
 */
export const getVaccinationById = async (
  vaccinationId: string,
): Promise<VaccinationDetail> => {
  if (!vaccinationId || vaccinationId.trim() === '') {
    console.error('❌ getVaccinationById: Invalid vaccination ID');
    throw new Error('Vaccination ID is required');
  }

  console.log('🔵 getVaccinationById called with ID:', vaccinationId);

  const endpoint = `${API_BASE_URL}/api/medical-records/vaccinations/${vaccinationId}`;
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
    console.log('✅ Vaccination fetched successfully:', data);
    return data.data || data;
  } catch (error: any) {
    console.error('❌ Error fetching vaccination:', error);
    throw error;
  }
};
