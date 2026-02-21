import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import FormCard from '../../components/form/FormCard';
import Badge from '../../components/ui/badge/Badge';

export interface PetCareCenterFormData {
  name: string;
  slug: string;
  contact_email: string;
  contact_number: string;
  status: 1 | 0;
}

export interface PetCareCenter {
  id: string;
  name: string;
  slug: string;
  contact_email: string;
  contact_number: string;
  status: number;
}

interface PetCareCenterFormProps {
  clinic?: PetCareCenter | null;
  onSubmit: (data: PetCareCenterFormData) => void;
  onCancel: () => void;
}

import { API_ENDPOINTS } from '../../constants/api';

const API_BASE = API_ENDPOINTS.CLINICS.BASE;

const slugify = (s: string) =>
  s
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');

export default function PetCareCenterForm({
  clinic,
  onSubmit,
  onCancel,
}: PetCareCenterFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<PetCareCenterFormData>({
    defaultValues: {
      name: clinic?.name ?? '',
      slug: clinic?.slug ?? slugify(clinic?.name ?? ''),
      contact_email: clinic?.contact_email ?? '',
      contact_number: clinic?.contact_number ?? '',
      status: clinic?.status === 1 ? 1 : 0,
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [banner, setBanner] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const bannerTimerRef = useRef<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  const nameValue = watch('name');
  const status = watch('status');
  const slugValue = watch('slug');

  // Sync slug with name
  useEffect(() => {
    const s = slugify(nameValue || '');
    setValue('slug', s, { shouldDirty: true });
  }, [nameValue, setValue]);

  // Clear banner after 5s (only for success messages)
  useEffect(() => {
    if (!banner) return;
    if (banner.type === 'error') return;
    if (bannerTimerRef.current) {
      window.clearTimeout(bannerTimerRef.current);
    }
    bannerTimerRef.current = window.setTimeout(() => setBanner(null), 5000);
    return () => {
      if (bannerTimerRef.current) {
        window.clearTimeout(bannerTimerRef.current);
      }
    };
  }, [banner]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (bannerTimerRef.current) window.clearTimeout(bannerTimerRef.current);
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    };
  }, []);

  const parseResponse = async (res: Response) => {
    const txt = await res.text();
    try {
      return txt ? JSON.parse(txt) : {};
    } catch {
      return { message: txt || res.statusText };
    }
  };

  const handleForm = async (data: PetCareCenterFormData) => {
    setIsLoading(true);
    setBanner(null);

    const payload = {
      name: data.name,
      slug: data.slug ?? slugify(data.name),
      contact_email: data.contact_email,
      contact_number: data.contact_number,
      status: data.status,
    };

    try {
      const token = sessionStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      let res: Response;
      let responseData: any;

      if (clinic) {
        // PUT
        res = await fetch(`${API_BASE}/${clinic.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload),
        });
      } else {
        // POST
        res = await fetch(API_BASE, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });
      }

      responseData = await parseResponse(res);

      if (!res.ok) {
        const errorMsg =
          responseData?.message ||
          responseData?.error ||
          (responseData?.errors && responseData.errors[0]?.message) ||
          res.statusText;
        throw new Error(errorMsg);
      }

      const returned = responseData?.data ?? responseData ?? {};

      setBanner({
        message: clinic
          ? 'Clinic updated successfully!'
          : 'Clinic created successfully!',
        type: 'success',
      });

      const newData: PetCareCenterFormData = {
        name: returned?.name ?? payload.name,
        slug: returned?.slug ?? payload.slug,
        contact_email: returned?.contact_email ?? payload.contact_email,
        contact_number: returned?.contact_number ?? payload.contact_number,
        status: returned?.status ?? payload.status,
      };

      onSubmit(newData);
      reset();

      // Close after banner shown for 2s
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = window.setTimeout(() => onCancel(), 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      console.error('PetCareCenterForm error:', err);
      setBanner({
        message: `${clinic ? 'Update' : 'Create'} failed: ${message}. Please try again.`,
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='p-4 mx-auto max-w-4xl md:p-6'>
      {/* Banner */}
      {banner && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg text-white font-medium max-w-sm ${
            banner.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          <div className='flex items-start gap-3'>
            <div className='flex-shrink-0 pt-0.5'>
              {banner.type === 'success' ? (
                <svg
                  className='w-5 h-5'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                    clipRule='evenodd'
                  />
                </svg>
              ) : (
                <svg
                  className='w-5 h-5'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                    clipRule='evenodd'
                  />
                </svg>
              )}
            </div>
            <div className='flex-1'>
              <p className='text-sm break-words'>{banner.message}</p>
            </div>
            <button
              onClick={() => setBanner(null)}
              className='flex-shrink-0 ml-3 inline-flex text-white hover:opacity-75 transition-opacity'
              aria-label='Dismiss'
            >
              <svg className='w-5 h-5' viewBox='0 0 20 20' fill='currentColor'>
                <path
                  fillRule='evenodd'
                  d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                  clipRule='evenodd'
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      <FormCard
        title={clinic ? 'Edit Pet Care Center' : 'Create Pet Care Center'}
        onClose={onCancel}
      >
        <form
          id='petcare-center-form'
          onSubmit={handleSubmit(handleForm)}
          className='grid grid-cols-1 lg:grid-cols-3 gap-6'
        >
          {/* Left Sidebar */}
          <div className='lg:col-span-1'>
            <div className='sticky top-2 space-y-4'>
              {/* Clinic Name Display */}
              <div className='bg-gray-50 p-4 rounded-lg'>
                <p className='text-xs font-semibold text-gray-500 uppercase tracking-wide'>
                  Clinic Name
                </p>
                <p className='text-lg font-bold text-gray-900 mt-2'>
                  {slugValue ? watch('name') : 'New Clinic'}
                </p>
              </div>

              {/* Status Badge & Selector */}
              <div className='space-y-3'>
                <div>
                  <p className='text-xs font-semibold text-gray-500 uppercase tracking-wide'>
                    Status
                  </p>
                  <div className='mt-2'>
                    <Badge
                      size='sm'
                      color={status === 1 ? 'success' : 'error'}
                    >
                      {status === 1 ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                <select
                  className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  value={String(status)}
                  disabled={isLoading}
                  onChange={(e) =>
                    setValue('status', e.target.value === '1' ? 1 : 0)
                  }
                >
                  <option value='1'>Active</option>
                  <option value='0'>Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Right Content Cards */}
          <div className='lg:col-span-2 space-y-4'>
            {/* Clinic Information Card */}
            <div className='bg-white border border-gray-200 rounded-lg p-4'>
              <h4 className='text-sm font-semibold text-gray-800 mb-4'>Clinic Information</h4>
              <div className='space-y-4'>
                {/* Clinic Name */}
                <div className='flex flex-col space-y-1'>
                  <label
                    className='text-xs font-semibold text-gray-600 uppercase tracking-wide'
                    htmlFor='name'
                  >
                    Clinic Name <span className='text-red-500'>*</span>
                  </label>
                  <input
                    id='name'
                    type='text'
                    disabled={isLoading}
                    className={`px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.name ? 'border-red-500' : 'border-gray-200'
                    }`}
                    placeholder='Enter clinic name'
                    {...register('name', {
                      required: 'Clinic name is required',
                      minLength: {
                        value: 2,
                        message: 'Clinic name must be at least 2 characters',
                      },
                    })}
                  />
                  {errors.name && (
                    <span className='text-xs text-red-600'>
                      {errors.name.message}
                    </span>
                  )}
                </div>

                {/* Slug */}
                <div className='flex flex-col space-y-1'>
                  <label
                    className='text-xs font-semibold text-gray-600 uppercase tracking-wide'
                    htmlFor='slug'
                  >
                    Slug
                  </label>
                  <input
                    id='slug'
                    type='text'
                    readOnly
                    disabled
                    value={slugValue}
                    className='px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50'
                  />
                  <input type='hidden' {...register('slug')} />
                  <p className='text-xs text-gray-500'>
                    Auto-generated from clinic name
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Information Card */}
            <div className='bg-white border border-gray-200 rounded-lg p-4'>
              <h4 className='text-sm font-semibold text-gray-800 mb-4'>Contact Information</h4>
              <div className='grid grid-cols-2 gap-3'>
                {/* Email */}
                <div className='flex flex-col space-y-1'>
                  <label
                    className='text-xs font-semibold text-gray-600 uppercase tracking-wide'
                    htmlFor='contact_email'
                  >
                    Email <span className='text-red-500'>*</span>
                  </label>
                  <input
                    id='contact_email'
                    type='email'
                    disabled={isLoading}
                    className={`px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.contact_email ? 'border-red-500' : 'border-gray-200'
                    }`}
                    placeholder='Enter email'
                    {...register('contact_email', {
                      required: 'Contact email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                  />
                  {errors.contact_email && (
                    <span className='text-xs text-red-600'>
                      {errors.contact_email.message}
                    </span>
                  )}
                </div>

                {/* Phone Number */}
                <div className='flex flex-col space-y-1'>
                  <label
                    className='text-xs font-semibold text-gray-600 uppercase tracking-wide'
                    htmlFor='contact_number'
                  >
                    Phone <span className='text-red-500'>*</span>
                  </label>
                  <input
                    id='contact_number'
                    type='tel'
                    disabled={isLoading}
                    className={`px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.contact_number ? 'border-red-500' : 'border-gray-200'
                    }`}
                    placeholder='Enter phone'
                    {...register('contact_number', {
                      required: 'Contact number is required',
                      minLength: {
                        value: 10,
                        message: 'Contact number must be at least 10 digits',
                      },
                      pattern: {
                        value: /^[0-9\s\-\+\(\)]{10,}$/,
                        message: 'Invalid contact number format',
                      },
                    })}
                  />
                  {errors.contact_number && (
                    <span className='text-xs text-red-600'>
                      {errors.contact_number.message}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className='lg:col-span-3 flex justify-end gap-3 pt-4 border-t'>
            <button
              type='button'
              onClick={onCancel}
              disabled={isLoading}
              className='px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 disabled:bg-gray-400 transition-colors'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={isLoading}
              className='px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors'
            >
              {isLoading ? (
                <span className='flex items-center gap-2'>
                  <svg
                    className='w-4 h-4 animate-spin'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                    />
                    <path
                      className='opacity-75'
                      fill='none'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    />
                  </svg>
                  Processing...
                </span>
              ) : clinic ? (
                'Update Clinic'
              ) : (
                'Create Clinic'
              )}
            </button>
            
          </div>
        </form>
      </FormCard>
    </div>
  );
}
