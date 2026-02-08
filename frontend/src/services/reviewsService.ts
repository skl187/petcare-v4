// Reviews Service - API calls for appointment reviews
import { API_ENDPOINTS } from '../constants/api';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface Review {
  id: string;
  rating: string;
  review_text: string | null;
  status: 'pending' | 'approved' | 'rejected';
  professionalism_rating: number | null;
  knowledge_rating: number | null;
  communication_rating: number | null;
  facility_rating: number | null;
  is_anonymous: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  appointment_id: string;
  appointment_number?: string;
  appointment_date?: string;
  appointment_type?: string;
  user_id?: string;
  owner_first_name?: string | null;
  owner_last_name?: string | null;
  pet_id?: string;
  pet_name?: string;
  veterinarian_id?: string;
  vet_first_name?: string;
  vet_last_name?: string;
  clinic_id?: string;
  clinic_name?: string;
}

export interface ReviewStats {
  total_reviews: string;
  average_rating: string;
  avg_professionalism: string;
  avg_knowledge: string;
  avg_communication: string;
  avg_facility: string;
  positive_reviews: string;
  negative_reviews: string;
}

// Veterinarian Review Types (matching actual my-reviews API structure)
export interface VeterinarianReviewFromAPI {
  id: string;
  rating: string;
  review_text: string | null;
  status: string;
  professionalism_rating: number | null;
  knowledge_rating: number | null;
  communication_rating: number | null;
  facility_rating: number | null;
  is_anonymous: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string | null;
  appointment_id: string | null;
  appointment_date: string | null;
  appointment_type: string | null;
  owner_first_name: string | null;
  owner_last_name: string | null;
  pet_name: string | null;
}

export interface VeterinarianReviewStats {
  total_reviews: string;
  average_rating: string;
  avg_professionalism: string;
  avg_knowledge: string;
  avg_communication: string;
  avg_facility: string;
  positive_reviews: string;
  negative_reviews: string;
}

export interface VeterinarianReviewsResponse {
  user_type?: string;
  reviews: VeterinarianReviewFromAPI[];
  stats: VeterinarianReviewStats;
  pagination: Pagination;
}

export interface PendingReviewAppointment {
  id: string;
  appointment_number: string;
  appointment_date: string;
  appointment_time: string;
  appointment_type: string;
  pet_name: string;
  vet_first_name: string;
  vet_last_name: string;
  veterinarian_id: string;
  clinic_name: string;
}

export interface CreateReviewData {
  appointment_id: string;
  rating: number;
  review_text?: string;
  professionalism_rating?: number;
  knowledge_rating?: number;
  communication_rating?: number;
  facility_rating?: number;
  is_anonymous?: boolean;
}

export interface UpdateReviewData {
  rating?: number;
  review_text?: string;
  professionalism_rating?: number;
  knowledge_rating?: number;
  communication_rating?: number;
  facility_rating?: number;
  is_anonymous?: boolean;
  status?: 'pending' | 'approved' | 'rejected'; // Admin only
}

export interface CanReviewResponse {
  can_review: boolean;
  reason?: string;
  existing_review_id?: string;
  veterinarian_id?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
  timestamp: string;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

const getAuthHeaders = (): HeadersInit => {
  const token = sessionStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// List all reviews (admin)
export const listReviews = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  veterinarian_id?: string;
  user_id?: string;
  rating_min?: number;
  rating_max?: number;
}): Promise<{ reviews: Review[]; pagination: Pagination }> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set('page', params.page.toString());
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.status) queryParams.set('status', params.status);
  if (params?.veterinarian_id)
    queryParams.set('veterinarian_id', params.veterinarian_id);
  if (params?.user_id) queryParams.set('user_id', params.user_id);
  if (params?.rating_min)
    queryParams.set('rating_min', params.rating_min.toString());
  if (params?.rating_max)
    queryParams.set('rating_max', params.rating_max.toString());

  const url = `${API_ENDPOINTS.REVIEWS.BASE}?${queryParams.toString()}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch reviews: ${response.statusText}`);
  }

  const result: ApiResponse<{ reviews: Review[]; pagination: Pagination }> =
    await response.json();
  return result.data;
};

// Get single review by ID
export const getReview = async (id: string): Promise<Review> => {
  const response = await fetch(API_ENDPOINTS.REVIEWS.DETAIL(id), {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch review: ${response.statusText}`);
  }

  const result: ApiResponse<Review> = await response.json();
  return result.data;
};

// Get review by appointment ID
export const getReviewByAppointment = async (
  appointmentId: string,
): Promise<Review | null> => {
  const response = await fetch(
    API_ENDPOINTS.REVIEWS.BY_APPOINTMENT(appointmentId),
    {
      method: 'GET',
      headers: getAuthHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch review: ${response.statusText}`);
  }

  const result: ApiResponse<Review | null> = await response.json();
  return result.data;
};

// Get reviews for a veterinarian
export const getVeterinarianReviews = async (
  veterinarianId: string,
  params?: { page?: number; limit?: number },
): Promise<{
  reviews: Review[];
  stats: ReviewStats;
  pagination: Pagination;
}> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set('page', params.page.toString());
  if (params?.limit) queryParams.set('limit', params.limit.toString());

  const url = `${API_ENDPOINTS.REVIEWS.BY_VETERINARIAN(veterinarianId)}?${queryParams.toString()}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch veterinarian reviews: ${response.statusText}`,
    );
  }

  const result: ApiResponse<{
    reviews: Review[];
    stats: ReviewStats;
    pagination: Pagination;
  }> = await response.json();
  return result.data;
};

// Get reviews for a veterinarian (correct API structure)
export const getVeterinarianReviewsNew = async (
  veterinarianId: string,
  params?: { page?: number; limit?: number },
): Promise<VeterinarianReviewsResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set('page', params.page.toString());
  if (params?.limit) queryParams.set('limit', params.limit.toString());

  const url = `${API_ENDPOINTS.REVIEWS.BY_VETERINARIAN(veterinarianId)}?${queryParams.toString()}`;
  console.log('[reviewsService] Fetching from:', url);

  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch veterinarian reviews: ${response.statusText}`,
    );
  }

  const result: ApiResponse<VeterinarianReviewsResponse> =
    await response.json();
  console.log('[reviewsService] API Response:', result);
  return result.data;
};

// Get current user's reviews
export const getMyReviews = async (params?: {
  page?: number;
  limit?: number;
}): Promise<{ reviews: Review[]; pagination: Pagination }> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set('page', params.page.toString());
  if (params?.limit) queryParams.set('limit', params.limit.toString());

  const url = `${API_ENDPOINTS.REVIEWS.MY_REVIEWS}?${queryParams.toString()}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch your reviews: ${response.statusText}`);
  }

  const result: ApiResponse<{ reviews: Review[]; pagination: Pagination }> =
    await response.json();
  return result.data;
};

// Get appointments pending review
export const getPendingReviewAppointments = async (): Promise<{
  appointments: PendingReviewAppointment[];
  count: number;
}> => {
  const response = await fetch(API_ENDPOINTS.REVIEWS.PENDING, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch pending review appointments: ${response.statusText}`,
    );
  }

  const result: ApiResponse<{
    appointments: PendingReviewAppointment[];
    count: number;
  }> = await response.json();
  return result.data;
};

// Check if user can review an appointment
export const canReviewAppointment = async (
  appointmentId: string,
): Promise<CanReviewResponse> => {
  const response = await fetch(
    API_ENDPOINTS.REVIEWS.CAN_REVIEW(appointmentId),
    {
      method: 'GET',
      headers: getAuthHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to check review eligibility: ${response.statusText}`,
    );
  }

  const result: ApiResponse<CanReviewResponse> = await response.json();
  return result.data;
};

// Create a new review
export const createReview = async (data: CreateReviewData): Promise<Review> => {
  const response = await fetch(API_ENDPOINTS.REVIEWS.BASE, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message || `Failed to create review: ${response.statusText}`,
    );
  }

  const result: ApiResponse<Review> = await response.json();
  return result.data;
};

// Update a review
export const updateReview = async (
  id: string,
  data: UpdateReviewData,
): Promise<Review> => {
  const response = await fetch(API_ENDPOINTS.REVIEWS.DETAIL(id), {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message || `Failed to update review: ${response.statusText}`,
    );
  }

  const result: ApiResponse<Review> = await response.json();
  return result.data;
};

// Delete a review
export const deleteReview = async (id: string): Promise<void> => {
  const response = await fetch(API_ENDPOINTS.REVIEWS.DETAIL(id), {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message || `Failed to delete review: ${response.statusText}`,
    );
  }
};
