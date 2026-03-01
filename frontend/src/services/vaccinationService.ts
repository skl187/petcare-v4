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
  _appointmentId: string,
  payload: VaccinationPayload,
): Promise<any> => {
  const endpoint = `${API_BASE_URL}/api/medical-records/vaccinations`;

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
 * Update an existing vaccination record with single vaccination (PATCH)
 */
export const updateVaccination = async (
  vaccinationId: string,
  vaccination: Vaccination,
): Promise<any> => {
  const endpoint = `${API_BASE_URL}/api/medical-records/vaccinations/${vaccinationId}`;

  try {
    const response = await fetch(endpoint, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(vaccination),
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
 * Get vaccination record by ID
 */
export const getVaccinationById = async (
  vaccinationId: string,
): Promise<VaccinationDetail> => {
  if (!vaccinationId || vaccinationId.trim() === '') {
    throw new Error('Vaccination ID is required');
  }

  const endpoint = `${API_BASE_URL}/api/medical-records/vaccinations/${vaccinationId}`;

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
