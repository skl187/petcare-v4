import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { EyeCloseIcon, EyeIcon } from '../icons';
import Label from '../components/form/Label';
import Input from '../components/form/input/InputField';
import PageMeta from '../components/common/PageMeta';
import AuthLayout from './AuthPageLayout';
import { API_ENDPOINTS } from '../constants/api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  // Redirect to signin if no token present
  useEffect(() => {
    if (!token) {
      navigate('/signin', { replace: true });
    }
  }, [token, navigate]);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // auto-dismiss banners
  useEffect(() => {
    if (apiError) {
      const t = setTimeout(() => setApiError(''), 6000);
      return () => clearTimeout(t);
    }
  }, [apiError]);

  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(() => {
        setSuccessMessage('');
        navigate('/signin', { replace: true });
      }, 4000);
      return () => clearTimeout(t);
    }
  }, [successMessage, navigate]);

  const validatePassword = (p: string) => p.length >= 6;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setApiError('');
    setSuccessMessage('');

    const newErrors: { newPassword?: string; confirmPassword?: string } = {};
    if (!newPassword) newErrors.newPassword = 'New password is required.';
    else if (!validatePassword(newPassword))
      newErrors.newPassword = 'Password must be at least 6 characters.';
    if (!confirmPassword)
      newErrors.confirmPassword = 'Please confirm your password.';
    else if (newPassword !== confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match.';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    if (!token) {
      setApiError('Invalid or missing token.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token, new_password: newPassword }),
      });
      const data = await response.json();

      if (!response.ok) {
        setApiError(data.message || 'Password reset failed. Please try again.');
      } else {
        setSuccessMessage(
          data.message ||
            'Password reset successful. Redirecting to sign in...',
        );
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      console.error(err);
      setApiError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    newPassword.trim() &&
    confirmPassword.trim() &&
    newPassword === confirmPassword;

  return (
    <>
      <PageMeta title='BracePet' description='BracePet' />
      <AuthLayout>
        <div className='flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar'>
          <div className='flex flex-col justify-center flex-1 w-full max-w-md mx-auto'>
            <div>
              <div className='mb-5 sm:mb-8'>
                <h1 className='mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md'>
                  Reset Password
                </h1>
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                  Enter your new password
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className='space-y-5'>
                  {apiError && (
                    <div className='p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:text-red-400 dark:border-red-900'>
                      {apiError}
                    </div>
                  )}

                  {successMessage && (
                    <div className='p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:text-green-400 dark:border-green-900'>
                      {successMessage}
                    </div>
                  )}

                  <div>
                    <Label>
                      New Password <span className='text-error-500'>*</span>
                    </Label>
                    <div className='relative'>
                      <Input
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder='Enter your new password'
                        value={newPassword}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          setNewPassword(e.target.value)
                        }
                      />
                      <span
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className='absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2'
                      >
                        {showNewPassword ? (
                          <EyeIcon className='fill-gray-500 dark:fill-gray-400 size-5' />
                        ) : (
                          <EyeCloseIcon className='fill-gray-500 dark:fill-gray-400 size-5' />
                        )}
                      </span>
                    </div>
                    {errors.newPassword && (
                      <p className='text-red-500 text-sm'>
                        {errors.newPassword}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label>
                      Confirm Password <span className='text-error-500'>*</span>
                    </Label>
                    <Input
                      type='password'
                      placeholder='Confirm your new password'
                      value={confirmPassword}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setConfirmPassword(e.target.value)
                      }
                    />
                    {errors.confirmPassword && (
                      <p className='text-red-500 text-sm'>
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  <div>
                    <button
                      type='submit'
                      disabled={!isFormValid || loading}
                      className='flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      {loading ? 'Resetting Password...' : 'Reset Password'}
                    </button>
                  </div>
                </div>
              </form>

              <div className='mt-5'>
                <p className='text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start'>
                  Remember your password?{' '}
                  <Link
                    to='/signin'
                    className='text-brand-500 hover:text-brand-600 dark:text-brand-400'
                  >
                    Sign In
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </AuthLayout>
    </>
  );
}
