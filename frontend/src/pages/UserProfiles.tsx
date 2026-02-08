import { useEffect, useState } from 'react';
import PageBreadcrumb from '../components/common/PageBreadCrumb';
import UserMetaCard from '../components/UserProfile/UserMetaCard';
import UserInfoCard from '../components/UserProfile/UserInfoCard';
import UserAddressCard from '../components/UserProfile/UserAddressCard';
import PageMeta from '../components/common/PageMeta';
import { fetchProfile, ProfileData } from '../services/profileService';

export default function UserProfiles() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await fetchProfile();
      setProfileData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
      console.error('Profile load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='text-center'>
          <p className='text-red-500 mb-4'>{error}</p>
          <button
            onClick={loadProfile}
            className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title='BracePet Profile Dashboard '
        description='This is BracePet Profile Dashboard page '
      />
      <PageBreadcrumb pageTitle='Profile' />
      <div className='rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800/50 lg:p-6'>
        <h3 className='mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7'>
          Profile
        </h3>
        <div className='space-y-6'>
          <UserMetaCard profileData={profileData} />
          <UserInfoCard profileData={profileData} onUpdate={loadProfile} />
          <UserAddressCard profileData={profileData} onUpdate={loadProfile} />
        </div>
      </div>
    </>
  );
}
