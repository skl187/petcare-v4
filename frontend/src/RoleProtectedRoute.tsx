// RoleProtectedRoute.tsx
import { useAuth } from './components/auth/AuthContext';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

type RoleProtectedRouteProps = {
  allowedRoles: (
    | 'admin'
    | 'veterinary'
    | 'veterinarian'
    | 'owner'
    | 'superadmin'
    | 'doctor'
  )[];
};

const RoleProtectedRoute = ({ allowedRoles }: RoleProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to='/signin' state={{ from: location }} replace />;
  }

  // Get user role - handle both single role and roles array
  let userRole: string | undefined = user.role;
  if (!userRole && user.roles && user.roles.length > 0) {
    const firstRole = user.roles[0];
    // Handle both object {name: 'role', slug: 'role'} and string 'role'
    if (typeof firstRole === 'string') {
      userRole = firstRole.toLowerCase();
    } else if (firstRole && typeof firstRole === 'object') {
      userRole = (
        (firstRole as any).slug ||
        (firstRole as any).name ||
        ''
      ).toLowerCase();
    }
  }

  // Get role-based home path for redirect
  const getRoleBasedHomePath = (): string => {
    const normalizedRole = (userRole || '').toLowerCase().trim();

    switch (normalizedRole) {
      case 'veterinary':
      case 'veterinarian':
        return '/vet/home';
      case 'owner':
        return '/owner/home';
      case 'superadmin':
      case 'admin':
      default:
        return '/home';
    }
  };

  // Check if user's role is in allowed roles
  if (userRole && !allowedRoles.includes(userRole as any)) {
    console.warn(`User role '${userRole}' not in allowed roles:`, allowedRoles);
    return <Navigate to={getRoleBasedHomePath()} replace />;
  }

  return <Outlet />;
};

export default RoleProtectedRoute;
