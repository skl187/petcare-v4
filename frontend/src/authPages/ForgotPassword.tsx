import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Label from '../components/form/Label';
import Input from '../components/form/input/InputField';
import Button from '../components/ui/button/Button';
import PageMeta from '../components/common/PageMeta';
import AuthLayout from './AuthPageLayout';
import { API_ENDPOINTS } from '../constants/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState<string>('');
  const [apiError, setApiError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

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
        navigate('/signin');
      }, 5000);
      return () => clearTimeout(t);
    }
  }, [successMessage, navigate]);

  const validateEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setApiError('');
    setSuccessMessage('');

    if (!email) {
      setApiError('Email is required.');
      return;
    }
    if (!validateEmail(email)) {
      setApiError('Enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) {
        setApiError(data.message || 'Request failed. Please try again.');
      } else {
        setSuccessMessage(
          data.message ||
            'If this email exists, a reset link has been sent. Redirecting to sign in...',
        );
      }
    } catch (err) {
      console.error('Error:', err);
      setApiError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isValid = validateEmail(email);

  return (
    <>
      <PageMeta title='BracePet' description='BracePet' />
      <AuthLayout>
        <div className='flex flex-col flex-1'>
          <div className='w-full max-w-md pt-10 mx-auto'></div>

          <div className='flex flex-col justify-center flex-1 w-full max-w-md mx-auto'>
            <div>
              <div className='mb-5 sm:mb-8'>
                <h1 className='mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md'>
                  Forgot Password
                </h1>
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                  Enter your email to receive password reset instructions.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className='space-y-6'>
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
                      Email <span className='text-error-500'>*</span>
                    </Label>
                    <Input
                      placeholder='info@gmail.com'
                      value={email}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setEmail(e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <Button
                      className='w-full'
                      size='sm'
                      disabled={!isValid || loading}
                    >
                      {loading ? 'Sending...' : 'Send reset link'}
                    </Button>
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
