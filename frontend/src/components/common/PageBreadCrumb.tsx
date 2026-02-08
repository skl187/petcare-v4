import { Link } from 'react-router';
import { useAuth } from '../auth/AuthContext';

interface BreadcrumbProps {
  pageTitle: string;
}

const PageBreadcrumb: React.FC<BreadcrumbProps> = ({ pageTitle }) => {
  const { user } = useAuth();

  // Get role-based home path
  const getHomePath = (): string => {
    if (!user) return '/home';

    let userRole: string | undefined = user.role;

    // If no direct role, extract from roles array
    if (!userRole && user.roles && user.roles.length > 0) {
      const firstRole = user.roles[0];
      // Handle both object {name: 'role', slug: 'role'} and string 'role'
      if (typeof firstRole === 'string') {
        userRole = firstRole as any;
      } else if (firstRole && typeof firstRole === 'object') {
        userRole = ((firstRole as any).slug || (firstRole as any).name) as any;
      }
    }

    const normalizedRole = (userRole || '').toLowerCase().trim();

    console.log('PageBreadcrumb - User:', user);
    console.log('PageBreadcrumb - userRole:', userRole);
    console.log('PageBreadcrumb - normalizedRole:', normalizedRole);

    switch (normalizedRole) {
      case 'veterinary':
      case 'veterinarian':
        console.log('PageBreadcrumb - Redirecting to /vet/home');
        return '/vet/home';
      case 'owner':
        console.log('PageBreadcrumb - Redirecting to /owner/home');
        return '/owner/home';
      case 'superadmin':
      case 'admin':
        console.log('PageBreadcrumb - Redirecting to /home');
        return '/home';
      default:
        console.log('PageBreadcrumb - Default redirect to /home');
        return '/home';
    }
  };

  return (
    <div className='flex flex-wrap items-center justify-between gap-3 mb-6'>
      <h2
        className='text-xl font-semibold text-gray-800 dark:text-white/90'
        x-text='pageName'
      >
        {pageTitle}
      </h2>
      <nav>
        <ol className='flex items-center gap-1.5'>
          <li>
            <Link
              className='inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400'
              to={getHomePath()}
            >
              Home
              <svg
                className='stroke-current'
                width='17'
                height='16'
                viewBox='0 0 17 16'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M6.0765 12.667L10.2432 8.50033L6.0765 4.33366'
                  stroke=''
                  strokeWidth='1.2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </Link>
          </li>
          <li className='text-sm text-gray-800 dark:text-white/90'>
            {pageTitle}
          </li>
        </ol>
      </nav>
    </div>
  );
};

export default PageBreadcrumb;
