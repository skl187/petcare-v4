// Dashboard Service - API calls for dashboard summary data
import { API_ENDPOINTS } from '../constants/api';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

// Admin Dashboard Types
export interface AdminUserStats {
  total_users: string;
  active_users: string;
  pending_users: string;
  suspended_users: string;
  new_users_last_30_days: string;
  new_users_last_7_days: string;
}

export interface AdminPetStats {
  total_pets: string;
  new_pets_last_30_days: string;
}

export interface AdminAppointmentOverview {
  total_appointments: string;
  scheduled: string;
  confirmed: string;
  in_progress: string;
  completed: string;
  cancelled: string;
  no_show: string;
  rescheduled: string;
}

export interface AdminTodayAppointments {
  total: string;
  scheduled: string;
  confirmed: string;
  in_progress: string;
  completed: string;
  cancelled: string;
}

export interface AdminRevenueStats {
  total_revenue: string;
  revenue_last_30_days: string;
  revenue_last_7_days: string;
  revenue_today: string;
  pending_revenue: string;
}

export interface AdminClinicStats {
  total_clinics: string;
  active_clinics: string;
  clinics_24x7: string;
  emergency_clinics: string;
}

export interface AdminVetStats {
  total_vets: string;
  active_vets: string;
  emergency_vets: string;
  avg_rating: string;
}

export interface AdminRecentAppointment {
  id: string;
  appointment_number: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  appointment_type: string;
  total_amount: string;
  payment_status: string;
  user_first_name: string;
  user_last_name: string;
  pet_name: string;
  vet_first_name: string;
  vet_last_name: string;
  clinic_name: string;
}

export interface AdminTopClinic {
  id: string;
  name: string;
  slug: string;
  total_appointments: string;
  total_revenue: string;
}

export interface AdminTopVet {
  id: string;
  first_name: string;
  last_name: string;
  specialization: string;
  rating: string;
  total_appointments: string;
  total_revenue: string;
}

export interface AdminAppointmentTrend {
  appointment_date: string;
  total: string;
  completed: string;
  cancelled: string;
}

export interface AdminPaymentStats {
  pending_payments: string;
  completed_payments: string;
  partial_payments: string;
  refunded_payments: string;
}

export interface AdminDashboardData {
  users: AdminUserStats;
  pets: AdminPetStats;
  appointments: {
    overview: AdminAppointmentOverview;
    today: AdminTodayAppointments;
    recent: AdminRecentAppointment[];
    trends: AdminAppointmentTrend[];
  };
  revenue: AdminRevenueStats;
  clinics: {
    stats: AdminClinicStats;
    top: AdminTopClinic[];
  };
  veterinarians: {
    stats: AdminVetStats;
    top: AdminTopVet[];
  };
  payments: AdminPaymentStats;
}

// Owner Dashboard Types
export interface OwnerPetStats {
  total_pets: string;
  active_pets: string;
}

export interface OwnerAppointmentStats {
  total_appointments: string;
  scheduled: string;
  confirmed: string;
  completed: string;
  cancelled: string;
  today: string;
  upcoming: string;
  past_completed: string;
  total_spent: string;
  pending_payments: string;
}

export interface OwnerUpcomingAppointment {
  id: string;
  appointment_number: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  appointment_type: string;
  chief_complaint: string;
  total_amount: string;
  payment_status: string;
  pet_id: string;
  pet_name: string;
  vet_first_name: string;
  vet_last_name: string;
  specialization: string;
  clinic_name: string;
  clinic_phone: string;
}

export interface OwnerMedicalRecord {
  id: string;
  record_type: string;
  record_date: string;
  diagnosis: string;
  followup_required: boolean;
  followup_date: string | null;
  pet_id: string;
  pet_name: string;
  vet_first_name: string;
  vet_last_name: string;
}

export interface OwnerVaccinationAlert {
  id: string;
  vaccine_name: string;
  vaccination_date: string;
  next_due_date: string;
  pet_id: string;
  pet_name: string;
  alert_status: 'overdue' | 'due_soon' | 'ok';
}

export interface OwnerInsuranceStats {
  total_policies: string;
  active_policies: string;
  expired_policies: string;
  available_coverage: string;
}

export interface OwnerPaymentHistory {
  total_transactions: string;
  total_amount: string;
  total_paid: string;
  total_pending: string;
  pending_count: string;
}

export interface OwnerPet {
  id: string;
  name: string;
  gender: string;
  date_of_birth: string | null;
  age: string | null;
  weight: number | null;
  status: number;
  pet_type: string;
  breed: string;
  total_appointments: string;
  total_records: string;
  last_vaccination: string | null;
}

export interface OwnerDashboardData {
  pets: {
    stats: OwnerPetStats;
    list: OwnerPet[];
  };
  appointments: {
    stats: OwnerAppointmentStats;
    upcoming: OwnerUpcomingAppointment[];
  };
  medical: {
    recent_records: OwnerMedicalRecord[];
    vaccination_alerts: OwnerVaccinationAlert[];
  };
  insurance: OwnerInsuranceStats | null;
  payments: OwnerPaymentHistory;
}

// Veterinarian Dashboard Types
export interface VetProfile {
  id: string;
  license_number: string;
  specialization: string;
  consultation_fee: string;
  rating: string;
  total_appointments: number;
}

export interface VetAppointmentStats {
  total_appointments: string;
  scheduled: string;
  confirmed: string;
  in_progress: string;
  completed: string;
  cancelled: string;
  no_show: string;
  today_total: string;
  upcoming_total: string;
  this_week: string;
  this_month: string;
}

export interface VetTodayAppointment {
  id: string;
  appointment_number: string;
  appointment_time: string;
  status: string;
  priority: string;
  appointment_type: string;
  chief_complaint: string;
  total_amount: string;
  payment_status: string;
  user_id: string;
  user_first_name: string;
  user_last_name: string;
  user_phone: string;
  pet_id: string;
  pet_name: string;
  pet_type: string;
  breed: string;
  clinic_name: string;
}

export interface VetUpcomingAppointment {
  id: string;
  appointment_number: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  priority: string;
  appointment_type: string;
  chief_complaint: string;
  user_first_name: string;
  user_last_name: string;
  pet_id: string;
  pet_name: string;
  pet_type: string;
  clinic_name: string;
}

export interface VetPatientStats {
  total_patients: string;
  total_owners: string;
  new_patients_this_month: string;
}

export interface VetEarningsStats {
  total_earnings: string;
  earnings_today: string;
  earnings_this_week: string;
  earnings_this_month: string;
  pending_earnings: string;
  avg_consultation_value: string;
}

export interface VetRecentReview {
  id: string;
  rating: string;
  review_text: string | null;
  created_at: string;
  professionalism_rating: number | null;
  knowledge_rating: number | null;
  communication_rating: number | null;
  facility_rating: number | null;
  is_anonymous: boolean;
  owner_first_name: string | null;
  owner_last_name: string | null;
  pet_name: string;
  appointment_type: string;
}

export interface VetReviewStats {
  total_reviews: string;
  avg_rating: string;
  avg_professionalism: string;
  avg_knowledge: string;
  avg_communication: string;
  positive_reviews: string;
  negative_reviews: string;
  recent: VetRecentReview[];
}

export interface VetPendingRecord {
  id: string;
  appointment_number: string;
  appointment_date: string;
  appointment_time: string;
  pet_name: string;
  pet_type: string;
  user_first_name: string;
  user_last_name: string;
}

export interface VetRecentPatient {
  pet_id: string;
  pet_name: string;
  pet_type: string;
  breed: string;
  owner_first_name: string;
  owner_last_name: string;
  owner_phone: string;
  last_visit: string;
  last_complaint: string;
}

export interface VetClinic {
  id: string;
  name: string;
  slug: string;
  contact_number: string;
  is_primary: boolean;
  consultation_fee_override: string | null;
}

export interface VetAppointmentTrend {
  appointment_date: string;
  total: string;
  completed: string;
  missed: string;
  revenue: string;
}

export interface VetDashboardData {
  profile: VetProfile;
  appointments: {
    stats: VetAppointmentStats;
    today: VetTodayAppointment[];
    upcoming: VetUpcomingAppointment[];
    trends: VetAppointmentTrend[];
  };
  patients: {
    stats: VetPatientStats;
    recent: VetRecentPatient[];
  };
  earnings: VetEarningsStats;
  reviews: VetReviewStats;
  pending_records: VetPendingRecord[];
  clinics: VetClinic[];
}

// API Response wrapper
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

export const fetchAdminDashboard = async (): Promise<AdminDashboardData> => {
  const response = await fetch(API_ENDPOINTS.DASHBOARD.ADMIN_SUMMARY, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch admin dashboard: ${response.statusText}`);
  }

  const result: ApiResponse<AdminDashboardData> = await response.json();
  return result.data;
};

export const fetchOwnerDashboard = async (): Promise<OwnerDashboardData> => {
  const response = await fetch(API_ENDPOINTS.DASHBOARD.OWNER_SUMMARY, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch owner dashboard: ${response.statusText}`);
  }

  const result: ApiResponse<OwnerDashboardData> = await response.json();
  return result.data;
};

export const fetchVetDashboard = async (): Promise<VetDashboardData> => {
  const response = await fetch(API_ENDPOINTS.DASHBOARD.VETERINARIAN_SUMMARY, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch veterinarian dashboard: ${response.statusText}`);
  }

  const result: ApiResponse<VetDashboardData> = await response.json();
  return result.data;
};
