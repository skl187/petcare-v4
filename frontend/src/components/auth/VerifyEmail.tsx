import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import PageMeta from '../common/PageMeta';
import AuthLayout from '../../pages/AuthPages/AuthPageLayout';
import { API_ENDPOINTS } from '../../constants/api';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid verification link. No token provided.');
      setLoading(false);
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.AUTH.VERIFY_EMAIL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const data = await response.json();

        if (!response.ok) {
          setError(data.message || 'Verification failed. The link may have expired.');
        } else {
          setSuccess(true);
          // Auto-redirect after 3 seconds
          setTimeout(() => navigate('/signin', { replace: true }), 3000);
        }
      } catch (err) {
        console.error(err);
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <>
      <PageMeta title='Verify Email - PetCare' description='Verify your email address' />
      <AuthLayout>
        <div className='flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar'>
          <div className='flex flex-col justify-center flex-1 w-full max-w-md mx-auto'>
            <div>
              <div className='mb-5 sm:mb-8'>
                <h1 className='mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md'>
                  Email Verification
                </h1>
              </div>

              <div className='space-y-5'>
                {loading && (
                  <div className='p-4 text-center text-gray-600 dark:text-gray-400'>
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto mb-4'></div>
                    <p>Verifying your email...</p>
                  </div>
                )}

                {error && (
                  <div className='p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:text-red-400 dark:border-red-900'>
                    {error}
                  </div>
                )}

                {success && (
                  <div className='p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:text-green-400 dark:border-green-900'>
                    Email verified successfully! Redirecting to sign in...
                  </div>
                )}

                {!loading && (
                  <div className='text-center pt-4'>
                    <Link
                      to='/signin'
                      className='text-brand-500 hover:text-brand-600 dark:text-brand-400'
                    >
                      Go to Sign In
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </AuthLayout>
    </>
  );
}
