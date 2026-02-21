import { API_ENDPOINTS } from '../constants/api';

const getAuthHeaders = () => {
  const token = sessionStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  message?: string;
}

interface Schedule {
  id?: string;
  veterinarian_id?: string;
  clinic_id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_duration?: number;
  max_appointments_per_slot?: number;
  is_available?: boolean;
  clinic_name?: string;
}

interface ScheduleException {
  id?: string;
  veterinarian_id?: string;
  clinic_id?: string;
  exception_date: string;
  exception_type: 'leave' | 'holiday' | 'emergency' | 'conference' | 'other';
  start_time?: string;
  end_time?: string;
  reason?: string;
  is_recurring?: boolean;
}

// Get all schedules for a veterinarian
export const getVetSchedules = async () => {
  try {
    const url = `${API_ENDPOINTS.VET_SCHEDULES.BASE}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch vet schedules: ${response.statusText}`);
    }

    const result: ApiResponse<Schedule[]> = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching vet schedules:', error);
    throw error;
  }
};

// Create or update a single schedule
export const upsertSchedule = async (schedule: Schedule) => {
  try {
    const url = `${API_ENDPOINTS.VET_SCHEDULES || 'http://localhost:3000/api/vet-schedules'}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(schedule),
    });

    if (!response.ok) {
      throw new Error(`Failed to upsert schedule: ${response.statusText}`);
    }

    const result: ApiResponse<Schedule> = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error upserting schedule:', error);
    throw error;
  }
};

// Bulk update schedules for a vet (entire week)
export const bulkUpsertSchedules = async (schedules: Schedule[]) => {
  try {
    const url = `${API_ENDPOINTS.VET_SCHEDULES.BASE}/bulk`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ schedules }),
    });

    if (!response.ok) {
      // try to read any error message body for more detail
      let bodyText = '';
      try {
        bodyText = await response.text();
      } catch {}
      throw new Error(
        `Failed to bulk upsert schedules: ${response.status} ${response.statusText} ${bodyText}`,
      );
    }

    const result: ApiResponse<Schedule[]> = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error bulk upserting schedules:', error);
    throw error;
  }
};

// Delete a schedule
export const deleteSchedule = async (scheduleId: string) => {
  try {
    const url = `${API_ENDPOINTS.VET_SCHEDULES || 'http://localhost:3000/api/vet-schedules'}/${scheduleId}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete schedule: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error deleting schedule:', error);
    throw error;
  }
};

// Get schedule exceptions
export const getScheduleExceptions = async (
  from_date?: string,
  to_date?: string,
) => {
  try {
    const params = new URLSearchParams();
    if (from_date) params.append('from_date', from_date);
    if (to_date) params.append('to_date', to_date);

    const queryString = params.toString() ? `?${params}` : '';
    const url = `${API_ENDPOINTS.VET_SCHEDULES.EXCEPTIONS}${queryString}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch schedule exceptions: ${response.statusText}`,
      );
    }

    const result: ApiResponse<ScheduleException[]> = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching schedule exceptions:', error);
    throw error;
  }
};

// Create a schedule exception
export const createScheduleException = async (exception: ScheduleException) => {
  try {
    const url = `${API_ENDPOINTS.VET_SCHEDULES.EXCEPTIONS}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(exception),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to create schedule exception: ${response.statusText}`,
      );
    }

    const result: ApiResponse<ScheduleException> = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error creating schedule exception:', error);
    throw error;
  }
};

// Delete a schedule exception
export const deleteScheduleException = async (exceptionId: string) => {
  try {
    const url = `${API_ENDPOINTS.VET_SCHEDULES.EXCEPTIONS}/${exceptionId}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to delete schedule exception: ${response.statusText}`,
      );
    }

    return response.json();
  } catch (error) {
    console.error('Error deleting schedule exception:', error);
    throw error;
  }
};

export default {
  getVetSchedules,
  upsertSchedule,
  bulkUpsertSchedules,
  deleteSchedule,
  getScheduleExceptions,
  createScheduleException,
  deleteScheduleException,
};
