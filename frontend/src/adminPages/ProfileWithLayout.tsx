import { useAuth } from '../components/auth/AuthContext';
import { Navigate } from 'react-router-dom';
import { SidebarProvider, useSidebar } from '../context/SidebarContext';
import AppHeader from '../layout/AppHeader';
import Backdrop from '../layout/Backdrop';
import AppSidebar from '../layout/AppSidebar';
import VetSidebar from '../layout/VetLayout/VetSidebar';
import OwnerSidebar from '../layout/OwnerLayout/OwnerSidebar';
import UserProfiles from './UserProfiles';

/**
 * Layout content with role-based sidebar
 */
const ProfileLayoutContent: React.FC = () => {
  const { user } = useAuth();
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  // Determine which sidebar to render based on user role
  let userRole: string | undefined = user?.role;

  // If no direct role, extract from roles array
  if (!userRole && user?.roles && user.roles.length > 0) {
    const firstRole = user.roles[0];
    // Handle both object {name: 'role', slug: 'role'} and string 'role'
    if (typeof firstRole === 'string') {
      userRole = firstRole as any;
    } else if (firstRole && typeof firstRole === 'object') {
      userRole = ((firstRole as any).slug || (firstRole as any).name) as any;
    }
  }

  const roleLower = (userRole || '').toLowerCase();

  let SidebarComponent = AppSidebar; // Default to admin sidebar

  if (roleLower === 'veterinary' || roleLower === 'veterinarian') {
    SidebarComponent = VetSidebar;
  } else if (roleLower === 'owner') {
    SidebarComponent = OwnerSidebar;
  }

  return (
    <div>
      <div>
        <SidebarComponent />
        <Backdrop />
      </div>
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? 'lg:ml-[290px]' : 'lg:ml-[90px]'
        } ${isMobileOpen ? 'ml-0' : ''}`}
      >
        <AppHeader />
        <div className='p-4 md:p-6'>
          <UserProfiles />
        </div>
      </div>
    </div>
  );
};

/**
 * ProfileWithLayout - Profile page accessible to all authenticated users
 * Renders with appropriate role-based sidebar and shared header
 */
export default function ProfileWithLayout() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to='/signin' />;
  }

  return (
    <SidebarProvider>
      <ProfileLayoutContent />
    </SidebarProvider>
  );
}
