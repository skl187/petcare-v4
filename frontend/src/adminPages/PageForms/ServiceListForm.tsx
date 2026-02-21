import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import FormCard from '../../components/form/FormCard';
import { API_ENDPOINTS } from '../../constants/api';

export interface ServiceFormData {
  code: string;
  name: string;
  slug: string;
  default_duration_minutes: number;
  default_fee: number;
  status: 1 | 0;
}

export interface ServiceForEdit {
  id: string;
  code: string;
  name: string;
  slug: string;
  default_duration_minutes: number;
  default_fee: number;
  status: number;
}

interface Props {
  service?: ServiceForEdit | null;
  onSubmit: (data: ServiceFormData) => void;
  onCancel: () => void;
}

const slugify = (str: string) =>
  str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');

export default function ServiceListForm({
  service,
  onSubmit,
  onCancel,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<ServiceFormData>({
    mode: 'onChange',
    defaultValues: service
      ? {
          code: service.code,
          name: service.name,
          slug: service.slug,
          default_duration_minutes: service.default_duration_minutes,
          default_fee: service.default_fee,
          status: service.status === 1 ? 1 : 0,
        }
      : {
          code: '',
          name: '',
          slug: '',
          default_duration_minutes: 30,
          default_fee: 0,
          status: 1,
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

  // Auto-generate slug from name
  useEffect(() => {
    if (nameValue) {
      const slug = slugify(nameValue);
      setValue('slug', slug);
    }
  }, [nameValue, setValue]);

  // Reset form when service changes (for editing)
  useEffect(() => {
    if (service) {
      const formData: ServiceFormData = {
        code: service.code || '',
        name: service.name || '',
        slug: service.slug || '',
        default_duration_minutes: service.default_duration_minutes || 30,
        default_fee: service.default_fee || 0,
        status: (service.status === 1 ? 1 : 0) as 1 | 0,
      };
      reset(formData, { keepDefaultValues: false });
    }
  }, [service, reset]);

  // Auto-dismiss success banners after 5s
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

  const handleForm = async (data: ServiceFormData) => {
    setIsLoading(true);
    setBanner(null);

    const payload = {
      code: data.code,
      name: data.name,
      slug: data.slug || slugify(data.name),
      default_duration_minutes: data.default_duration_minutes,
      default_fee: data.default_fee,
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

      if (service) {
        // PUT
        res = await fetch(API_ENDPOINTS.VET_SERVICES.DETAIL(service.id), {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload),
        });
      } else {
        // POST
        res = await fetch(API_ENDPOINTS.VET_SERVICES.BASE, {
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

      setBanner({
        message: service
          ? 'Service updated successfully!'
          : 'Service created successfully!',
        type: 'success',
      });

      onSubmit(data);
      reset();

      // close after banner shown for 2s
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = window.setTimeout(() => onCancel(), 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      console.error('ServiceListForm error:', err);
      setBanner({
        message: `${service ? 'Update' : 'Create'} failed: ${message}. Please try again.`,
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
        title={service ? 'Edit Service' : 'Add New Service'}
        onClose={onCancel}
      >
        <form onSubmit={handleSubmit(handleForm)} className='space-y-6'>
          {/* Service Details */}
          <section className='space-y-4'>
            <h3 className='text-lg font-semibold text-gray-800 border-b pb-2'>
              Service Details
            </h3>

            {/* Code */}
            <div className='flex flex-col space-y-2'>
              <label
                className='text-sm font-medium text-gray-700'
                htmlFor='code'
              >
                Service Code <span className='text-red-500'>*</span>
              </label>
              <input
                id='code'
                type='text'
                disabled={isLoading}
                className={`px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.code ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='e.g., CONSULT'
                {...register('code', {
                  required: 'Service code is required',
                  minLength: {
                    value: 2,
                    message: 'Code must be at least 2 characters',
                  },
                })}
              />
              {errors.code && (
                <span className='text-sm text-red-600'>
                  {errors.code.message}
                </span>
              )}
            </div>

            {/* Name */}
            <div className='flex flex-col space-y-2'>
              <label
                className='text-sm font-medium text-gray-700'
                htmlFor='name'
              >
                Service Name <span className='text-red-500'>*</span>
              </label>
              <input
                id='name'
                type='text'
                disabled={isLoading}
                className={`px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='e.g., Consultation'
                {...register('name', {
                  required: 'Service name is required',
                  minLength: {
                    value: 2,
                    message: 'Service name must be at least 2 characters',
                  },
                })}
              />
              {errors.name && (
                <span className='text-sm text-red-600'>
                  {errors.name.message}
                </span>
              )}
            </div>

            {/* Slug */}
            <div className='flex flex-col space-y-2'>
              <label
                className='text-sm font-medium text-gray-700'
                htmlFor='slug'
              >
                Slug
              </label>
              <input
                id='slug'
                type='text'
                readOnly
                disabled
                value={watch('slug')}
                className='px-4 py-2 border rounded-md bg-gray-50'
              />
              <input type='hidden' {...register('slug')} />
              <p className='text-xs text-gray-500'>
                Automatically generated from name
              </p>
            </div>
          </section>

          {/* Service Parameters */}
          <section className='space-y-4'>
            <h3 className='text-lg font-semibold text-gray-800 border-b pb-2'>
              Service Parameters
            </h3>

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              {/* Duration */}
              <div className='flex flex-col space-y-2'>
                <label
                  className='text-sm font-medium text-gray-700'
                  htmlFor='duration'
                >
                  Default Duration (minutes){' '}
                  <span className='text-red-500'>*</span>
                </label>
                <input
                  id='duration'
                  type='number'
                  min='1'
                  disabled={isLoading}
                  className={`px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.default_duration_minutes
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                  placeholder='30'
                  {...register('default_duration_minutes', {
                    required: 'Duration is required',
                    min: {
                      value: 1,
                      message: 'Duration must be at least 1 minute',
                    },
                  })}
                />
                {errors.default_duration_minutes && (
                  <span className='text-sm text-red-600'>
                    {errors.default_duration_minutes.message}
                  </span>
                )}
              </div>

              {/* Fee */}
              <div className='flex flex-col space-y-2'>
                <label
                  className='text-sm font-medium text-gray-700'
                  htmlFor='fee'
                >
                  Default Fee ($) <span className='text-red-500'>*</span>
                </label>
                <input
                  id='fee'
                  type='number'
                  step='0.01'
                  min='0'
                  disabled={isLoading}
                  className={`px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.default_fee ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder='50.00'
                  {...register('default_fee', {
                    required: 'Default fee is required',
                    min: {
                      value: 0,
                      message: 'Fee cannot be negative',
                    },
                  })}
                />
                {errors.default_fee && (
                  <span className='text-sm text-red-600'>
                    {errors.default_fee.message}
                  </span>
                )}
              </div>
            </div>
          </section>

          {/* Status */}
          <section className='space-y-4'>
            <h3 className='text-lg font-semibold text-gray-800 border-b pb-2'>
              Status
            </h3>
            <div className='flex flex-col space-y-2'>
              <label className='text-sm font-medium text-gray-700'>
                Status <span className='text-red-500'>*</span>
              </label>
              <select
                {...register('status')}
                className='px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>
          </section>

          {/* Buttons */}
          <div className='flex justify-end gap-3 pt-4 border-t'>
            <button
              type='button'
              onClick={onCancel}
              className='px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={isLoading}
              className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-medium'
            >
              {isLoading ? 'Saving...' : service ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </FormCard>
    </div>
  );
}
