// AuthContext.tsx
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';

type User = {
  email: string;
  role?: 'admin' | 'veterinary' | 'owner' | 'superadmin' | 'doctor';
  roles?: string[];
  [key: string]: any; // Allow other properties from API
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: () => Promise<boolean>;
  logout: () => void;
  setUser: (user: User | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on initial load
  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Ensure role is set from roles array if not present
        if (
          !parsedUser.role &&
          parsedUser.roles &&
          parsedUser.roles.length > 0
        ) {
          const firstRole = parsedUser.roles[0];
          // Handle both object {name: 'role', slug: 'role'} and string 'role'
          parsedUser.role =
            typeof firstRole === 'string'
              ? firstRole.toLowerCase()
              : (
                  (firstRole as any).slug ||
                  (firstRole as any).name ||
                  ''
                ).toLowerCase();
        }
        console.log('AuthContext loaded user:', parsedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error('Failed to parse stored user:', e);
        sessionStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (): Promise<boolean> => {
    // This is now handled by the SignInForm component
    // The API call is made there and user data is stored directly via setUser
    return false;
  };

  const setUserData = (userData: User | null) => {
    if (userData) {
      // Map roles array to role (pick first role)
      const firstRole = userData.roles?.[0];
      let roleString: string | undefined;

      // Handle both object {name: 'role', slug: 'role'} and string 'role'
      if (typeof firstRole === 'string') {
        roleString = firstRole.toLowerCase();
      } else if (firstRole && typeof firstRole === 'object') {
        roleString = (
          (firstRole as any).slug ||
          (firstRole as any).name ||
          ''
        ).toLowerCase();
      } else {
        roleString = userData.role;
      }

      const mappedUser: User = {
        ...userData,
        role: roleString as any,
      };

      console.log('AuthContext setUser - Original userData:', userData);
      console.log('AuthContext setUser - Mapped user:', mappedUser);

      setUser(mappedUser);
      sessionStorage.setItem('user', JSON.stringify(mappedUser));
    } else {
      setUser(null);
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('token');
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, setUser: setUserData }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { AuthContext, type User, type AuthContextType };
