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
          parsedUser.role = parsedUser.roles[0].toLowerCase();
        }
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
      const mappedUser: User = {
        ...userData,
        role: (userData.roles?.[0]?.toLowerCase() as any) || userData.role,
      };
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
