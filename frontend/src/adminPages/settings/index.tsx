import { FC, Suspense } from 'react';
import SettingsSidebar from './components/SettingsSidebar';
import MailSettings from './components/MailSettings';

const AdminSettings: FC = () => {
  return (
    <div className='space-y-6'>
      {/* Settings Layout */}
      <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
        {/* Sidebar - Hidden on mobile, shown on lg and up */}
        <div className='lg:col-span-1'>
          <SettingsSidebar />
        </div>

        {/* Content Area */}
        <div className='lg:col-span-3 bg-white rounded-xl shadow-md p-6 dark:bg-gray-800'>
          <Suspense
            fallback={
              <div className='text-center py-8 text-body-base text-gray-500'>
                Loading...
              </div>
            }
          >
            <MailSettings />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
