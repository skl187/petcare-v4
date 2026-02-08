// API Base URL from environment variables
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://api.bracepetcare.app';

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    LOGOUT: `${API_BASE_URL}/api/auth/logout`,
    FORGOT_PASSWORD: `${API_BASE_URL}/api/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE_URL}/api/auth/reset-password`,
    VERIFY_EMAIL: `${API_BASE_URL}/api/auth/verify-email`,
    RESEND_VERIFICATION: `${API_BASE_URL}/api/auth/resend-verification`,
  },

  // Pets
  PETS: {
    BASE: `${API_BASE_URL}/api/pets`,
    DETAIL: (id: string) => `${API_BASE_URL}/api/pets/${id}`,
  },

  // Pet Types
  PET_TYPES: {
    BASE: `${API_BASE_URL}/api/pet-types`,
  },

  // Breeds
  BREEDS: {
    BASE: `${API_BASE_URL}/api/breeds`,
  },

  // Veterinary Bookings
  VETERINARY_BOOKINGS: {
    BASE: (filter: string = 'today') =>
      `${API_BASE_URL}/api/appointments/vet/list?filter=${filter}`,
    DETAIL: (id: string) => `${API_BASE_URL}/api/appointments/${id}`,
  },

  // Appointments
  APPOINTMENTS: {
    BASE: `${API_BASE_URL}/api/appointments`,
    DETAIL: (id: string) => `${API_BASE_URL}/api/appointments/${id}`,
  },

  // Vet Services
  VET_SERVICES: {
    BASE: `${API_BASE_URL}/api/vet-services`,
    DETAIL: (id: string) => `${API_BASE_URL}/api/vet-services/${id}`,
  },

  // Clinics
  CLINICS: {
    BASE: `${API_BASE_URL}/api/clinics`,
  },

  // Veterinarians
  VETERINARIANS: {
    BASE: `${API_BASE_URL}/api/veterinarians`,
    DETAIL: (id: string) => `${API_BASE_URL}/api/veterinarians/${id}`,
  },

  // Roles
  ROLES: {
    BASE: `${API_BASE_URL}/api/roles`,
    DETAIL: (id: string) => `${API_BASE_URL}/api/roles/${id}`,
    PERMISSIONS: (id: string) => `${API_BASE_URL}/api/roles/${id}/permissions`,
  },

  // Permissions
  PERMISSIONS: {
    BASE: `${API_BASE_URL}/api/permissions`,
    GROUPED: `${API_BASE_URL}/api/permissions/grouped`,
    RESOURCES: `${API_BASE_URL}/api/permissions/resources`,
    DETAIL: (id: string) => `${API_BASE_URL}/api/permissions/${id}`,
  },

  // Users
  USERS: {
    BASE: `${API_BASE_URL}/api/users`,
    DETAIL: (id: string) => `${API_BASE_URL}/api/users/${id}`,
    ROLES: (id: string) => `${API_BASE_URL}/api/users/${id}/roles`,
    PERMISSIONS: (id: string) => `${API_BASE_URL}/api/users/${id}/permissions`,
    ADDRESSES: (id: string) => `${API_BASE_URL}/api/users/${id}/addresses`,
    ADDRESS_DETAIL: (userId: string, addressId: string) =>
      `${API_BASE_URL}/api/users/${userId}/addresses/${addressId}`,
  },

  // Dashboard
  DASHBOARD: {
    ADMIN_SUMMARY: `${API_BASE_URL}/api/dashboard/admin/summary`,
    OWNER_SUMMARY: `${API_BASE_URL}/api/dashboard/owner/summary`,
    VETERINARIAN_SUMMARY: `${API_BASE_URL}/api/dashboard/veterinarian/summary`,
    PROFILE: `${API_BASE_URL}/api/dashboard/profile`,
  },

  // Reviews
  REVIEWS: {
    BASE: `${API_BASE_URL}/api/reviews`,
    MY_REVIEWS: `${API_BASE_URL}/api/reviews/my-reviews`,
    PENDING: `${API_BASE_URL}/api/reviews/pending`,
    CAN_REVIEW: (appointmentId: string) =>
      `${API_BASE_URL}/api/reviews/can-review/${appointmentId}`,
    BY_APPOINTMENT: (appointmentId: string) =>
      `${API_BASE_URL}/api/reviews/appointment/${appointmentId}`,
    BY_VETERINARIAN: (veterinarianId: string) =>
      `${API_BASE_URL}/api/reviews/veterinarian/${veterinarianId}`,
    DETAIL: (id: string) => `${API_BASE_URL}/api/reviews/${id}`,
  },
} as const;
