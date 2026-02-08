import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { EyeCloseIcon, EyeIcon } from '../../icons';
import Label from '../form/Label';
import Input from '../form/input/InputField';
import Checkbox from '../form/input/Checkbox';
import Button from '../ui/button/Button';
import { API_ENDPOINTS } from '../../constants/api';

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errors, setErrors] = useState<{ email: string; password: string }>({
    email: '',
    password: '',
  });
  const [apiError, setApiError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [roleToNavigate, setRoleToNavigate] = useState<string | null>(null);

  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  // Auto-dismiss error banner after 6 seconds
  useEffect(() => {
    if (apiError) {
      const timer = setTimeout(() => {
        setApiError('');
      }, 6000);

      return () => clearTimeout(timer);
    }
  }, [apiError]);

  // Navigate when user is set and role is available
  useEffect(() => {
    if (user && roleToNavigate) {
      console.log('User set in context, navigating to appropriate route');
      handleRoleBasedRedirect(roleToNavigate);
      setRoleToNavigate(null); // Reset to prevent multiple navigations
    }
  }, [user, roleToNavigate]);

  // Validate email format using regex
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate password length
  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  // Function to handle redirection based on role
  const handleRoleBasedRedirect = (role: string) => {
    const normalizedRole = role.toLowerCase().trim();
    console.log('Normalized role:', normalizedRole);

    switch (normalizedRole) {
      case 'superadmin':
      case 'admin':
        console.log('Redirecting to /home');
        navigate('/home');
        break;
      case 'doctor':
      case 'veterinary':
      case 'veterinarian':
        console.log('Redirecting to /vet/home');
        navigate('/vet/home');
        break;
      case 'owner':
        console.log('Redirecting to /owner/home');
        navigate('/owner/home');
        break;
      default:
        console.log('Default redirect to /home');
        navigate('/home');
    }
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setApiError('');

    let newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'Email is required.';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Enter a valid email address.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (!validatePassword(password)) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    setErrors(newErrors as { email: string; password: string });

    if (Object.keys(newErrors).length === 0) {
      setLoading(true);

      try {
        const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            password: password,
          }),
        });

        const data = await response.json();
        console.log('Login response:', data);

        if (!response.ok) {
          setApiError(data.message || 'Invalid credentials. Please try again.');
          setLoading(false);
          return;
        }

        // Store token
        if (data.data?.token) {
          sessionStorage.setItem('token', data.data.token);
          console.log('Token stored');
        }

        // Get user data from response
        const userData = data.data?.user;
        console.log('User data:', userData);

        if (!userData) {
          setApiError('No user data received. Please try again.');
          setLoading(false);
          return;
        }

        // Store user data via AuthContext
        setUser(userData);
        console.log('User data stored');

        // Get role for redirection
        const roles = userData.roles || [];
        const role = roles.length > 0 ? roles[0] : userData.role;

        console.log('Roles array:', roles);
        console.log('Role for redirect:', role);

        // Set loading to false
        setLoading(false);

        // Set role for navigation (useEffect will handle the actual navigation)
        setRoleToNavigate(role);
      } catch (err) {
        setApiError('Network error. Please try again.');
        console.error('Error:', err);
        setLoading(false);
      }
    }
  };

  return (
    <div className='flex flex-col flex-1'>
      <div className='w-full max-w-md pt-10 mx-auto'>
        {/* Back to Dashboard Link */}
        {/* <Link to="/" className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
          <ChevronLeftIcon className="size-5" />
          Back to dashboard
        </Link> */}
      </div>
      <div className='flex flex-col justify-center flex-1 w-full max-w-md mx-auto'>
        <div>
          <div className='mb-5 sm:mb-8'>
            <h1 className='mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md'>
              Sign In
            </h1>
            <p className='text-sm text-gray-500 dark:text-gray-400'>
              Enter your email and password to sign in!
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className='space-y-6'>
              {/* API Error Banner */}
              {apiError && (
                <div className='p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:text-red-400 dark:border-red-900'>
                  {apiError}
                </div>
              )}

              {/* Email Field */}
              <div>
                <Label>
                  Email <span className='text-error-500'>*</span>
                </Label>
                <Input
                  placeholder='info@gmail.com'
                  value={email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setEmail(e.target.value)
                  }
                />
                {errors.email && (
                  <p className='text-red-500 text-sm'>{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <Label>
                  Password <span className='text-error-500'>*</span>
                </Label>
                <div className='relative'>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder='Enter your password'
                    value={password}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setPassword(e.target.value)
                    }
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2'
                  >
                    {showPassword ? (
                      <EyeIcon className='fill-gray-500 dark:fill-gray-400 size-5' />
                    ) : (
                      <EyeCloseIcon className='fill-gray-500 dark:fill-gray-400 size-5' />
                    )}
                  </span>
                </div>
                {errors.password && (
                  <p className='text-red-500 text-sm'>{errors.password}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <Checkbox
                    checked={isChecked}
                    onChange={() => setIsChecked(!isChecked)}
                  />
                  <span className='block font-normal text-gray-700 text-theme-sm dark:text-gray-400'>
                    Keep me logged in
                  </span>
                </div>
                <Link
                  to='/forgot-password'
                  className='text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400'
                >
                  Forgot password?
                </Link>
              </div>

              {/* Sign-in Button */}
              <div>
                <Button
                  className='w-full'
                  size='sm'
                  disabled={
                    !email ||
                    !password ||
                    loading ||
                    !validateEmail(email) ||
                    !validatePassword(password)
                  }
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </Button>
              </div>
            </div>
          </form>

          {/* Sign-up Link */}
          <div className='mt-5'>
            <p className='text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start'>
              Don&apos;t have an account? {''}
              <Link
                to='/signup'
                className='text-brand-500 hover:text-brand-600 dark:text-brand-400'
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
