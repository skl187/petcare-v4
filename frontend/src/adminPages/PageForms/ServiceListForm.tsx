import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import FormCard from '../../components/form/FormCard';
import Badge from '../../components/ui/badge/Badge';
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
  const codeValue = watch('code');
  const statusValue = watch('status');

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

  const getStatusColor = (status: number) => (status === 1 ? 'success' : 'error');

  return (
    <div className='p-2 mx-auto max-w-3xl md:p-3'>
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
        <form onSubmit={handleSubmit(handleForm)} className='space-y-4'>
          {/* Profile Layout: Left Sidebar + Right Content */}
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
            {/* Left Sidebar - Service Info Card */}
            <div className='lg:col-span-1'>
              <div className='bg-white border border-gray-200 rounded-lg p-4 sticky top-2'>
                {/* Service Code Section */}
                <div className='text-center border-b pb-2 mb-2'>
                  <p className='text-xs text-gray-500 uppercase tracking-wide'>Service Code</p>
                  <p className='text-sm font-semibold text-gray-800 mt-1'>
                    {codeValue || 'N/A'}
                  </p>
                </div>

                {/* Service Name Section */}
                <div className='text-center border-b pb-2 mb-2'>
                  <p className='text-xs text-gray-500 uppercase tracking-wide'>Service Name</p>
                  <h3 className='text-base font-bold text-gray-800 mt-1 truncate'>
                    {nameValue || 'Service'}
                  </h3>
                </div>

                {/* Status */}
                <div className='text-center'>
                  <p className='text-xs text-gray-500 uppercase tracking-wide mb-2'>Status</p>
                  <Badge 
                    size='sm' 
                    color={getStatusColor(statusValue)}
                  >
                    {statusValue === 1 ? 'Active' : 'Inactive'}
                  </Badge>
                  <select
                    {...register('status')}
                    className='w-full mt-2 px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    disabled={isLoading}
                  >
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Right Content - Service Details Grid */}
            <div className='lg:col-span-2 space-y-4'>
              {/* Service Information Card */}
              <div className='bg-white border border-gray-200 rounded-lg p-4'>
                <div className='flex items-center mb-3'>
                  <svg className='w-4 h-4 text-gray-700 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                  </svg>
                  <h3 className='text-base font-semibold text-gray-800'>Service Details</h3>
                </div>

                <div className='space-y-3'>
                  {/* Code */}
                  <div>
                    <label className='text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1' htmlFor='code'>
                      Service Code
                    </label>
                    <input
                      id='code'
                      type='text'
                      disabled={isLoading}
                      placeholder='e.g., CONSULT'
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                        errors.code ? 'border-red-500' : 'border-gray-300'
                      }`}
                      {...register('code', {
                        required: 'Service code is required',
                        minLength: {
                          value: 2,
                          message: 'Code must be at least 2 characters',
                        },
                      })}
                    />
                    {errors.code && (
                      <span className='text-xs text-red-600 mt-0.5 block'>{errors.code.message}</span>
                    )}
                  </div>

                  {/* Name */}
                  <div>
                    <label className='text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1' htmlFor='name'>
                      Service Name
                    </label>
                    <input
                      id='name'
                      type='text'
                      disabled={isLoading}
                      placeholder='e.g., Consultation'
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      {...register('name', {
                        required: 'Service name is required',
                        minLength: {
                          value: 2,
                          message: 'Service name must be at least 2 characters',
                        },
                      })}
                    />
                    {errors.name && (
                      <span className='text-xs text-red-600 mt-0.5 block'>{errors.name.message}</span>
                    )}
                  </div>

                  {/* Slug */}
                  <div>
                    <label className='text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1' htmlFor='slug'>
                      Slug
                    </label>
                    <input
                      id='slug'
                      type='text'
                      readOnly
                      disabled
                      value={watch('slug')}
                      className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-600'
                    />
                    <p className='text-xs text-gray-500 mt-1'>Automatically generated from name</p>
                  </div>
                </div>
              </div>

              {/* Service Parameters Card */}
              <div className='bg-white border border-gray-200 rounded-lg p-4'>
                <div className='flex items-center mb-3'>
                  <svg className='w-4 h-4 text-gray-700 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                  </svg>
                  <h3 className='text-base font-semibold text-gray-800'>Service Parameters</h3>
                </div>

                <div className='grid grid-cols-2 gap-3'>
                  {/* Duration */}
                  <div>
                    <label className='text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1' htmlFor='duration'>
                      Duration (min)
                    </label>
                    <input
                      id='duration'
                      type='number'
                      min='1'
                      disabled={isLoading}
                      placeholder='30'
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                        errors.default_duration_minutes ? 'border-red-500' : 'border-gray-300'
                      }`}
                      {...register('default_duration_minutes', {
                        required: 'Duration is required',
                        min: {
                          value: 1,
                          message: 'Duration must be at least 1 minute',
                        },
                      })}
                    />
                    {errors.default_duration_minutes && (
                      <span className='text-xs text-red-600 mt-0.5 block'>{errors.default_duration_minutes.message}</span>
                    )}
                  </div>

                  {/* Fee */}
                  <div>
                    <label className='text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1' htmlFor='fee'>
                      Default Fee ($)
                    </label>
                    <input
                      id='fee'
                      type='number'
                      step='0.01'
                      min='0'
                      disabled={isLoading}
                      placeholder='50.00'
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                        errors.default_fee ? 'border-red-500' : 'border-gray-300'
                      }`}
                      {...register('default_fee', {
                        required: 'Default fee is required',
                        min: {
                          value: 0,
                          message: 'Fee cannot be negative',
                        },
                      })}
                    />
                    {errors.default_fee && (
                      <span className='text-xs text-red-600 mt-0.5 block'>{errors.default_fee.message}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className='flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t'>
            <button
              type='button'
              onClick={onCancel}
              className='px-6 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition duration-200 text-sm font-medium disabled:opacity-70'
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={isLoading}
              className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 text-sm font-medium disabled:opacity-70 flex items-center justify-center'
            >
              {isLoading ? (
                <span className='flex items-center justify-center'>
                  <svg className='animate-spin -ml-1 mr-2 h-4 w-4 text-white' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                    <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                    <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                  </svg>
                  {service ? 'Updating...' : 'Creating...'}
                </span>
              ) : (
                service ? 'Update Service' : 'Add Service'
              )}
            </button>
          </div>
        </form>
      </FormCard>
    </div>
  );
}
