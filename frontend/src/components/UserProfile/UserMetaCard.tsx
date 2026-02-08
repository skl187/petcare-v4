import { ProfileData } from '../../services/profileService';

interface UserMetaCardProps {
  profileData: ProfileData | null;
}

export default function UserMetaCard({ profileData }: UserMetaCardProps) {
  if (!profileData) return null;

  const { user, roles, addresses } = profileData;
  const primaryRole = roles.find((r) => r.is_primary);
  const primaryAddress = addresses.find((a) => a.is_primary);

  return (
    <div className='p-5 border border-gray-200 rounded-2xl dark:border-gray-700 lg:p-6'>
      <div className='flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between'>
        <div className='flex flex-col items-center w-full gap-6 xl:flex-row'>
          <div className='w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-700 flex items-center justify-center bg-gray-100 dark:bg-gray-800'>
            <span className='text-3xl font-semibold text-gray-600 dark:text-gray-400'>
              {user.first_name?.charAt(0)}
              {user.last_name?.charAt(0)}
            </span>
          </div>
          <div className='order-3 xl:order-2'>
            <h4 className='mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left'>
              {user.display_name || `${user.first_name} ${user.last_name}`}
            </h4>
            <div className='flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left'>
              {primaryRole && (
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                  {primaryRole.name}
                </p>
              )}
              {primaryAddress && (
                <>
                  <div className='hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block'></div>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>
                    {primaryAddress.city}, {primaryAddress.state},{' '}
                    {primaryAddress.country}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
