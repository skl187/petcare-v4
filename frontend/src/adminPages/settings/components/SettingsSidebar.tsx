import { FC } from 'react';
import { Link, useLocation } from 'react-router';
import { MdEmail } from 'react-icons/md';

interface SettingsNavItem {
  name: string;
  icon: React.ReactNode;
  path: string;
}

const settingsNavItems: SettingsNavItem[] = [
  {
    name: 'Mail Setting',
    icon: <MdEmail className='w-5 h-5' />,
    path: '/admin/settings/mail',
  },
];

const SettingsSidebar: FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className='bg-white rounded-xl shadow-md overflow-hidden dark:bg-gray-800'>
      <div className='p-4 border-b border-gray-200 dark:border-gray-700'>
        <h3 className='text-heading-sm font-bold text-gray-900 dark:text-white'>
          Settings
        </h3>
      </div>
      <div className='overflow-y-auto max-h-[calc(100vh-200px)]'>
        {settingsNavItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 border-l-4 transition-colors ${
              isActive(item.path)
                ? 'border-l-orange-600 bg-orange-50 text-orange-600 dark:bg-orange-900/20'
                : 'border-l-transparent text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700/50'
            } cursor-pointer`}
          >
            <span className='text-lg'>{item.icon}</span>
            <div className='flex-1'>
              <span className='text-body-sm font-medium'>{item.name}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SettingsSidebar;
