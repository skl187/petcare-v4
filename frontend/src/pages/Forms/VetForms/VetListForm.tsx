import { useEffect, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import FormCard from '../../../components/form/FormCard';
import { MdClose } from 'react-icons/md';
import { API_ENDPOINTS } from '../../../constants/api';

export interface Clinic {
  id: string;
  name: string;
}

export interface VetService {
  id: string;
  name: string;
}

export interface VeterinarianFormData {
  first_name: string;
  last_name: string;
  email: string;
  license_number: string;
  vet_clinic_id: string;
  vet_service_ids: string[];
  status: 1 | 0;
  password?: string;
}

export interface VeterinarianForEdit {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  license_number: string;
  vet_clinic_id: string;
  vet_service_ids: string[];
  status: number;
  password?: string;
}

interface Props {
  veterinarian?: VeterinarianForEdit | null;
  clinics: Clinic[];
  services: VetService[];
  onSubmit: (data: VeterinarianFormData) => void;
  onCancel: () => void;
}

// Service Multi-Select Dropdown Component
interface ServiceMultiSelectProps {
  services: VetService[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
  hasError?: boolean;
}

function ServiceMultiSelect({
  services,
  selectedIds,
  onChange,
  disabled = false,
  hasError = false,
}: ServiceMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedServices = services.filter((s) => selectedIds.includes(s.id));

  const handleToggleService = (serviceId: string) => {
    const newIds = selectedIds.includes(serviceId)
      ? selectedIds.filter((id) => id !== serviceId)
      : [...selectedIds, serviceId];
    onChange(newIds);
  };

  const handleRemoveTag = (serviceId: string) => {
    const newIds = selectedIds.filter((id) => id !== serviceId);
    onChange(newIds);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className='relative' ref={dropdownRef}>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 border rounded-md bg-white cursor-pointer transition ${
          hasError ? 'border-red-500' : 'border-gray-300'
        } focus-within:ring-2 focus-within:ring-blue-500 ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : ''
        }`}
      >
        {selectedServices.length > 0 ? (
          <div className='flex flex-wrap gap-2'>
            {selectedServices.map((service) => (
              <div
                key={service.id}
                className='inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm'
              >
                {service.name}
                <button
                  type='button'
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveTag(service.id);
                  }}
                  disabled={disabled}
                  className='text-blue-600 hover:text-blue-900 disabled:cursor-not-allowed'
                >
                  <MdClose size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <span className='text-gray-500'>Select services...</span>
        )}
      </div>

      {isOpen && !disabled && (
        <div className='absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto'>
          {services.length > 0 ? (
            services.map((service) => (
              <label
                key={service.id}
                className='flex items-center gap-2 px-4 py-2 hover:bg-gray-50 cursor-pointer'
              >
                <input
                  type='checkbox'
                  checked={selectedIds.includes(service.id)}
                  onChange={() => handleToggleService(service.id)}
                  className='w-4 h-4 rounded'
                />
                <span className='text-sm text-gray-700'>{service.name}</span>
              </label>
            ))
          ) : (
            <div className='px-4 py-2 text-sm text-gray-500'>
              No services available
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function VetListForm({
  veterinarian,
  clinics,
  services,
  onSubmit,
  onCancel,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<VeterinarianFormData>({
    mode: 'onChange',
    defaultValues: veterinarian
      ? {
          first_name: veterinarian.first_name,
          last_name: veterinarian.last_name,
          email: veterinarian.email,
          license_number: veterinarian.license_number,
          vet_clinic_id: veterinarian.vet_clinic_id,
          vet_service_ids: veterinarian.vet_service_ids,
          status: veterinarian.status === 1 ? 1 : 0,
          password: '',
        }
      : {
          first_name: '',
          last_name: '',
          email: '',
          license_number: '',
          vet_clinic_id: '',
          vet_service_ids: [],
          status: 1,
          password: '',
        },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [banner, setBanner] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const bannerTimerRef = useRef<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  // Reset form when veterinarian changes (for editing)
  useEffect(() => {
    if (veterinarian) {
      const formData: VeterinarianFormData = {
        first_name: veterinarian.first_name || '',
        last_name: veterinarian.last_name || '',
        email: veterinarian.email || '',
        license_number: veterinarian.license_number || '',
        vet_clinic_id: veterinarian.vet_clinic_id || '',
        vet_service_ids: veterinarian.vet_service_ids || [],
        status: (veterinarian.status === 1 ? 1 : 0) as 1 | 0,
        password: '',
      };
      reset(formData, { keepDefaultValues: false });
    } else {
      // Reset form for new entry
      reset(
        {
          first_name: '',
          last_name: '',
          email: '',
          license_number: '',
          vet_clinic_id: '',
          vet_service_ids: [],
          status: 1,
          password: '',
        },
        { keepDefaultValues: false },
      );
    }
  }, [veterinarian, reset]);

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

  const handleForm = async (data: VeterinarianFormData) => {
    setIsLoading(true);
    setBanner(null);

    const payload = {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      license_number: data.license_number,
      vet_clinic_id: data.vet_clinic_id,
      vet_service_ids: data.vet_service_ids,
      status: data.status,
      ...(data.password && { password: data.password }),
    };

    try {
      const token = sessionStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      let res: Response;
      let responseData: any;

      if (veterinarian) {
        // PUT
        res = await fetch(API_ENDPOINTS.VETERINARIANS.DETAIL(veterinarian.id), {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload),
        });
      } else {
        // POST
        res = await fetch(API_ENDPOINTS.VETERINARIANS.BASE, {
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
        message: veterinarian
          ? 'Veterinarian updated successfully!'
          : 'Veterinarian created successfully!',
        type: 'success',
      });

      onSubmit(data);
      reset();

      // close after banner shown for 2s
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = window.setTimeout(() => onCancel(), 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      console.error('VetListForm error:', err);
      setBanner({
        message: `${veterinarian ? 'Update' : 'Create'} failed: ${message}. Please try again.`,
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
        title={veterinarian ? 'Edit Veterinarian' : 'Add New Veterinarian'}
        onClose={onCancel}
      >
        <form onSubmit={handleSubmit(handleForm)} className='space-y-6'>
          {/* Basic Information */}
          <section className='space-y-4'>
            <h3 className='text-lg font-semibold text-gray-800 border-b pb-2'>
              Basic Information
            </h3>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  First Name <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  {...register('first_name', {
                    required: 'First name is required',
                    minLength: {
                      value: 2,
                      message: 'First name must be at least 2 characters',
                    },
                  })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.first_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder='Enter first name'
                  disabled={isLoading}
                />
                {errors.first_name && (
                  <span className='text-red-500 text-sm'>
                    {errors.first_name.message}
                  </span>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Last Name <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  {...register('last_name', {
                    required: 'Last name is required',
                    minLength: {
                      value: 2,
                      message: 'Last name must be at least 2 characters',
                    },
                  })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.last_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder='Enter last name'
                  disabled={isLoading}
                />
                {errors.last_name && (
                  <span className='text-red-500 text-sm'>
                    {errors.last_name.message}
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Email <span className='text-red-500'>*</span>
              </label>
              <input
                type='email'
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Invalid email format',
                  },
                })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='Enter email address'
                disabled={isLoading}
                autoComplete='off'
              />
              {errors.email && (
                <span className='text-red-500 text-sm'>
                  {errors.email.message}
                </span>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                License Number <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                {...register('license_number', {
                  required: 'License number is required',
                  minLength: {
                    value: 3,
                    message: 'License number must be at least 3 characters',
                  },
                })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.license_number ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='e.g., LIC-67890'
                disabled={isLoading}
              />
              {errors.license_number && (
                <span className='text-red-500 text-sm'>
                  {errors.license_number.message}
                </span>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Password <span className='text-red-500'>*</span>
              </label>
              <input
                type='password'
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    message:
                      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
                  },
                })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='Enter password'
                disabled={isLoading}
              />
              {errors.password && (
                <span className='text-red-500 text-sm'>
                  {errors.password.message}
                </span>
              )}
            </div>
          </section>

          {/* Clinic and Services */}
          <section className='space-y-4'>
            <h3 className='text-lg font-semibold text-gray-800 border-b pb-2'>
              Assignment
            </h3>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Pet Care Center <span className='text-red-500'>*</span>
              </label>
              <Controller
                name='vet_clinic_id'
                control={control}
                rules={{ required: 'Pet Care Center is required' }}
                render={({ field }) => (
                  <select
                    {...field}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.vet_clinic_id
                        ? 'border-red-500'
                        : 'border-gray-300'
                    }`}
                    disabled={isLoading}
                  >
                    <option value=''>Select Pet Care Center</option>
                    {clinics.map((clinic) => (
                      <option key={clinic.id} value={clinic.id}>
                        {clinic.name}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.vet_clinic_id && (
                <span className='text-red-500 text-sm'>
                  {errors.vet_clinic_id.message}
                </span>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Services <span className='text-red-500'>*</span>
              </label>
              <Controller
                name='vet_service_ids'
                control={control}
                rules={{
                  validate: (value) =>
                    (value && value.length > 0) ||
                    'At least one service must be selected',
                }}
                render={({ field }) => (
                  <ServiceMultiSelect
                    services={services}
                    selectedIds={field.value || []}
                    onChange={field.onChange}
                    disabled={isLoading}
                    hasError={!!errors.vet_service_ids}
                  />
                )}
              />
              {errors.vet_service_ids && (
                <span className='text-red-500 text-sm'>
                  {errors.vet_service_ids.message}
                </span>
              )}
            </div>
          </section>

          {/* Status */}
          <section className='space-y-4'>
            <h3 className='text-lg font-semibold text-gray-800 border-b pb-2'>
              Status
            </h3>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Status <span className='text-red-500'>*</span>
              </label>
              <Controller
                name='status'
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    disabled={isLoading}
                  >
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                )}
              />
            </div>
          </section>

          {/* Buttons */}
          <div className='flex justify-end gap-3 pt-4 border-t'>
            <button
              type='button'
              onClick={onCancel}
              disabled={isLoading}
              className='px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={isLoading}
              className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-medium'
            >
              {isLoading ? 'Saving...' : veterinarian ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </FormCard>
    </div>
  );
}
