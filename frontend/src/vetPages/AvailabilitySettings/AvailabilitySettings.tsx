import { useEffect, useState } from 'react';
import PageMeta from '../../components/common/PageMeta';
import VetScheduleAvailability from '../../components/vet/VetScheduleAvailability';
import VetScheduleExceptions from '../../components/vet/VetScheduleExceptions';
import { API_ENDPOINTS } from '../../constants/api';
import { useAuth } from '../../components/auth/AuthContext';

const getAuthHeaders = () => {
  const token = sessionStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

interface VetClinic {
  id: string;
  name: string;
  clinic_id: string;
  is_primary?: boolean;
}

interface VetInfo {
  id: string;
  user_id: string;
  clinics: VetClinic[];
}

const VetAvailabilitySettings = () => {
  const { user } = useAuth();
  const [vetInfo, setVetInfo] = useState<VetInfo | null>(null);
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // attempt to load vet info whenever we get a user object
    if (user?.id) {
      loadVetInfo();
    } else {
      // if no user (logged out) ensure we don't stay in loading state
      setLoading(false);
    }
  }, [user]);

  const loadVetInfo = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // make sure user has a veterinarian-type role before proceeding
      const isVet = user.roles?.some((role: any) => {
        const slug = typeof role === 'string' ? role : role?.slug || role?.name;
        return ['veterinary', 'veterinarian', 'doctor'].includes(
          (slug || '').toLowerCase(),
        );
      });
      if (!isVet) {
        throw new Error('User is not a veterinarian');
      }

      // fetch veterinarians list (backend ignores user_id but we'll filter client-side)
      const url = `${API_ENDPOINTS.VETERINARIANS.BASE}?user_id=${user.id}&limit=100`;
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      ``;

      if (!response.ok) {
        throw new Error('Failed to fetch veterinarian information');
      }

      const data = await response.json();
      // backend responses sometimes nest the array under data.data or data
      const vets: any[] = Array.isArray(data.data?.data)
        ? data.data.data
        : Array.isArray(data.data)
          ? data.data
          : Array.isArray(data)
            ? data
            : [];

      const veterinarian =
        vets.find((v: any) => v.user_id === user.id) || vets[0];
      if (!veterinarian) {
        throw new Error('No veterinarian record found for this user');
      }

      const clinicMappings = veterinarian.clinic_mappings || [];
      const clinics = clinicMappings.map((mapping: any) => ({
        id: mapping.clinic?.id || '',
        name: mapping.clinic?.name || '',
        clinic_id: mapping.clinic?.id || '',
        is_primary: false,
      }));

      setVetInfo({
        id: veterinarian.id,
        user_id: user.id,
        clinics,
      });
      setSelectedClinicId(clinics.length > 0 ? clinics[0].clinic_id : null);
    } catch (err) {
      setError(
        (err as Error).message ||
          'Failed to load vet information. Please try again.',
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title='Availability Settings'
        description='Manage your schedule and availability'
      />
      <div className='p-3 md:p-4'>
        <div className='mb-4'>
          <h1 className='text-2xl font-bold mb-1'>Availability Settings</h1>
          <p className='text-sm text-gray-600'>
            Manage your weekly schedule and time off
          </p>
        </div>

        {error && (
          <div className='mb-4 p-3 border border-red-200 bg-red-50 rounded-lg text-sm'>
            <p className='text-red-800'>{error}</p>
          </div>
        )}

        {/* Clinic Selector */}
        {vetInfo && vetInfo.clinics.length > 1 && (
          <div className='mb-4 bg-white rounded-lg shadow-sm border border-gray-200 p-3'>
            <label className='block text-xs font-medium text-gray-700 mb-2'>
              Select Clinic
            </label>
            <select
              value={selectedClinicId || ''}
              onChange={(e) => setSelectedClinicId(e.target.value)}
              className='w-full md:w-64 px-2 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
            >
              <option value=''>Choose a clinic...</option>
              {vetInfo.clinics.map((clinic) => (
                <option key={clinic.clinic_id} value={clinic.clinic_id}>
                  {clinic.name}
                  {clinic.is_primary ? ' (Primary)' : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Schedule Management */}
        {vetInfo && selectedClinicId && (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
            <VetScheduleAvailability
              veterinarian_id={vetInfo.id}
              clinic_id={selectedClinicId}
            />
            <VetScheduleExceptions
              veterinarian_id={vetInfo.id}
              clinic_id={selectedClinicId}
            />
          </div>
        )}

        {vetInfo && vetInfo.clinics.length === 0 && (
          <div className='p-3 border border-yellow-200 bg-yellow-50 rounded-lg text-sm'>
            <p className='text-yellow-800'>
              You are not associated with any clinics yet. Please contact an
              administrator to add you to a clinic.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default VetAvailabilitySettings;
