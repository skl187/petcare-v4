import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import PageMeta from '../common/PageMeta';
import AuthLayout from '../../pages/AuthPages/AuthPageLayout';
import { API_ENDPOINTS } from '../../constants/api';

export default function RegistrationSuccess() {
  const location = useLocation();
  const email = location.state?.email || '';
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendError, setResendError] = useState('');

  const handleResend = async () => {
    if (!email) return;

    setResending(true);
    setResendMessage('');
    setResendError('');

    try {
      const response = await fetch(API_ENDPOINTS.AUTH.RESEND_VERIFICATION, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (!response.ok) {
        setResendError(data.message || 'Failed to resend. Please try again.');
      } else {
        setResendMessage(data.message || 'Verification email sent!');
      }
    } catch (err) {
      console.error(err);
      setResendError('Network error. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      <PageMeta title='Check Your Email - PetCare' description='Registration successful' />
      <AuthLayout>
        <div className='flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar'>
          <div className='flex flex-col justify-center flex-1 w-full max-w-md mx-auto'>
            <div className='text-center'>
              <div className='mb-6'>
                <div className='mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4'>
                  <svg
                    className='w-8 h-8 text-green-600 dark:text-green-400'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                    />
                  </svg>
                </div>
                <h1 className='mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md'>
                  Check Your Email
                </h1>
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                  We've sent a verification link to{' '}
                  {email && (
                    <span className='font-medium text-gray-700 dark:text-gray-300'>
                      {email}
                    </span>
                  )}
                </p>
              </div>

              <div className='space-y-4'>
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                  Click the link in your email to verify your account. The link
                  will expire in 24 hours.
                </p>

                {resendMessage && (
                  <div className='p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:text-green-400 dark:border-green-900'>
                    {resendMessage}
                  </div>
                )}

                {resendError && (
                  <div className='p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:text-red-400 dark:border-red-900'>
                    {resendError}
                  </div>
                )}

                <div className='pt-4'>
                  <p className='text-sm text-gray-500 dark:text-gray-400 mb-2'>
                    Didn't receive the email?
                  </p>
                  <button
                    onClick={handleResend}
                    disabled={resending || !email}
                    className='text-brand-500 hover:text-brand-600 dark:text-brand-400 font-medium disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {resending ? 'Sending...' : 'Resend verification email'}
                  </button>
                </div>

                <div className='pt-6 border-t border-gray-200 dark:border-gray-700'>
                  <Link
                    to='/signin'
                    className='text-brand-500 hover:text-brand-600 dark:text-brand-400'
                  >
                    Back to Sign In
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AuthLayout>
    </>
  );
}
