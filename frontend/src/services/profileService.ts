// Profile Service - API calls for user profile management
import { API_ENDPOINTS } from '../constants/api';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ProfileUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  display_name: string;
  phone?: string;
  bio?: string;
}

export interface ProfileRole {
  id: string;
  name: string;
  slug: string;
  is_primary: boolean;
}

export interface ProfilePermission {
  id: string;
  name: string;
  action: string;
  resource: string;
}

export interface ProfileAddress {
  id?: string;
  type: string;
  label: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_primary: boolean;
}

export interface ProfileData {
  user: ProfileUser;
  roles: ProfileRole[];
  permissions: ProfilePermission[];
  addresses: ProfileAddress[];
  veterinarian: any | null;
  pets: {
    total: number;
  };
}

export interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
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

/**
 * Fetch user profile data
 */
export async function fetchProfile(): Promise<ProfileData> {
  const response = await fetch(`${API_ENDPOINTS.DASHBOARD.PROFILE}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch profile: ${response.statusText}`);
  }

  const result: ApiResponse<ProfileData> = await response.json();
  return result.data;
}

/**
 * Update user profile
 */
export async function updateProfile(
  profileData: Partial<ProfileUser>,
): Promise<ProfileUser> {
  const response = await fetch(`${API_ENDPOINTS.DASHBOARD.PROFILE}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    throw new Error(`Failed to update profile: ${response.statusText}`);
  }

  const result: ApiResponse<ProfileUser> = await response.json();
  return result.data;
}

/**
 * Create a new address for a user
 */
export async function createAddress(
  userId: string,
  addressData: Omit<ProfileAddress, 'id'>,
): Promise<ProfileAddress> {
  const response = await fetch(`${API_ENDPOINTS.USERS.ADDRESSES(userId)}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(addressData),
  });

  if (!response.ok) {
    throw new Error(`Failed to create address: ${response.statusText}`);
  }

  const result: ApiResponse<ProfileAddress> = await response.json();
  return result.data;
}

/**
 * Update an existing address
 */
export async function updateAddress(
  userId: string,
  addressId: string,
  addressData: Partial<ProfileAddress>,
): Promise<ProfileAddress> {
  const response = await fetch(
    `${API_ENDPOINTS.USERS.ADDRESS_DETAIL(userId, addressId)}`,
    {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(addressData),
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to update address: ${response.statusText}`);
  }

  const result: ApiResponse<ProfileAddress> = await response.json();
  return result.data;
}

/**
 * Delete an address
 */
export async function deleteAddress(
  userId: string,
  addressId: string,
): Promise<void> {
  const response = await fetch(
    `${API_ENDPOINTS.USERS.ADDRESS_DETAIL(userId, addressId)}`,
    {
      method: 'DELETE',
      headers: getAuthHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to delete address: ${response.statusText}`);
  }
}
