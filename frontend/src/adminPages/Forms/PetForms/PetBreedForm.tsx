import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import FormCard from '../../../components/form/FormCard';
import Badge from '../../../components/ui/badge/Badge';
import { API_ENDPOINTS } from '../../../constants/api';

const API_BASE = API_ENDPOINTS.BREEDS.BASE;

const slugify = (s: string) =>
  s
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');

export interface PetBreedFormData {
  name: string;
  petTypeId: string;
  petTypeName: string;
  description: string;
  status: 1 | 0;
  slug?: string;
}

export interface PetTypeOption {
  id: string;
  name: string;
}

export interface PetBreed {
  id: string;
  name: string;
  petTypeId: string;
  petTypeName: string;
  description: string;
  status: 1 | 0;
  slug?: string;
}

interface PetBreedFormProps {
  petBreed?: PetBreed | null;
  petTypes: PetTypeOption[];
  onSubmit: (data: PetBreedFormData) => void;
  onCancel: () => void;
}

export default function PetBreedForm({
  petBreed,
  petTypes,
  onSubmit,
  onCancel,
}: PetBreedFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<PetBreedFormData>({
    defaultValues: {
      name: petBreed?.name ?? '',
      petTypeId: petBreed?.petTypeId ?? (petTypes[0]?.id || ''),
      petTypeName: petBreed?.petTypeName ?? (petTypes[0]?.name || ''),
      description: petBreed?.description ?? '',
      status: petBreed?.status ?? 1,
      slug: petBreed?.slug ?? slugify(petBreed?.name ?? ''),
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [banner, setBanner] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const bannerTimerRef = useRef<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  const petTypeIdValue = watch('petTypeId');
  const status = watch('status');
  const nameValue = watch('name');
  const slugValue = watch('slug');

  // sync slug with name
  useEffect(() => {
    const s = slugify(nameValue || '');
    setValue('slug', s, { shouldDirty: true });
  }, [nameValue, setValue]);

  // Update petTypeName when petTypeId changes
  useEffect(() => {
    const selectedType = petTypes.find((t) => t.id === petTypeIdValue);
    if (selectedType) {
      setValue('petTypeName', selectedType.name);
    }
  }, [petTypeIdValue, petTypes, setValue]);

  // clear banner after 5s (only for success messages)
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

  // cleanup timers on unmount
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

  const handleForm = async (data: PetBreedFormData) => {
    setIsLoading(true);
    setBanner(null);

    const payload = {
      name: data.name,
      petTypeId: data.petTypeId,
      description: data.description,
      status: data.status,
      slug: data.slug ?? slugify(data.name),
    };

    try {
      const token = sessionStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      let res: Response;
      let responseData: any;

      if (petBreed) {
        // PUT
        res = await fetch(`${API_BASE}/${petBreed.id}`, {
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
          responseData?.detail ||
          (responseData?.errors && responseData.errors[0]?.message) ||
          res.statusText;
        throw new Error(errorMsg);
      }

      // Use either response.data or response root for returned object
      const returned = responseData?.data ?? responseData ?? {};

      setBanner({
        message: petBreed
          ? 'Breed updated successfully!'
          : 'Breed created successfully!',
        type: 'success',
      });

      const newData: PetBreedFormData = {
        name: returned?.name ?? payload.name,
        petTypeId: returned?.petTypeId ?? payload.petTypeId,
        petTypeName: returned?.petTypeName ?? data.petTypeName,
        description: returned?.description ?? payload.description,
        status: returned?.status ?? payload.status,
        slug: returned?.slug ?? payload.slug,
      };

      onSubmit(newData);
      reset();

      // close after banner shown for 5s
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = window.setTimeout(() => onCancel(), 5000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      console.error('PetBreedForm error:', err);
      setBanner({
        message: `${petBreed ? 'Update' : 'Create'} failed: ${message}. Please try again.`,
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {banner && (
        <div
          className={`fixed top-4 right-4 max-w-sm p-4 rounded-lg shadow-lg flex items-start gap-3 ${
            banner.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          } dark:${
            banner.type === 'success'
              ? 'bg-green-900 dark:text-green-100 dark:border-green-700'
              : 'bg-red-900 dark:text-red-100 dark:border-red-700'
          }`}
        >
          {banner.type === 'success' ? (
            <svg
              className='flex-shrink-0 w-5 h-5 mt-0.5'
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path
                fillRule='evenodd'
                d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                clipRule='evenodd'
              />
            </svg>
          ) : (
            <svg
              className='flex-shrink-0 w-5 h-5 mt-0.5'
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path
                fillRule='evenodd'
                d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                clipRule='evenodd'
              />
            </svg>
          )}
          <div className='flex-1'>
            <p className='text-sm font-medium'>{banner.message}</p>
          </div>
          <button
            onClick={() => setBanner(null)}
            className='flex-shrink-0 inline-flex text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
          >
            <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
              <path
                fillRule='evenodd'
                d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                clipRule='evenodd'
              />
            </svg>
          </button>
        </div>
      )}

      <FormCard
        title={`${petBreed ? 'Edit' : 'Add'} Pet Breed`}
        onClose={onCancel}
      >
        <form onSubmit={handleSubmit(handleForm)} className='space-y-4'>
          {/* Profile Layout: Left Sidebar + Right Content */}
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
            {/* Left Sidebar - Profile Card */}
            <div className='lg:col-span-1'>
              <div className='bg-white border border-gray-200 rounded-lg p-4 sticky top-2'>
                {/* Breed Name Section */}
                <div className='text-center border-b pb-2 mb-2'>
                  <h2 className='text-lg font-bold text-gray-800'>
                    {nameValue || 'Breed'}
                  </h2>
                  <p className='text-xs text-gray-500 mt-1'>Pet Breed Category</p>
                </div>

                {/* Pet Type */}
                <div className='text-center border-b pb-2 mb-2'>
                  <p className='text-xs text-gray-500 uppercase tracking-wide mb-1'>Pet Type</p>
                  <p className='text-xs font-semibold text-gray-700'>
                    {petTypes.find((t) => t.id === petTypeIdValue)?.name || 'Select Type'}
                  </p>
                </div>

                {/* Status */}
                <div className='text-center'>
                  <p className='text-xs text-gray-500 uppercase tracking-wide mb-2'>Status</p>
                  <select
                    className='w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    value={String(status)}
                    disabled={isLoading}
                    onChange={(e) =>
                      setValue('status', e.target.value === '1' ? 1 : 0)
                    }
                  >
                    <option value='1'>Active</option>
                    <option value='0'>Inactive</option>
                  </select>
                  <div className='mt-2'>
                    <Badge color={status === 1 ? 'success' : 'error'} size='sm'>
                      {status === 1 ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Information Grid */}
            <div className='lg:col-span-2 space-y-4'>
              {/* Breed Details Card */}
              <div className='bg-white border border-gray-200 rounded-lg p-4'>
                <div className='flex items-center mb-3'>
                  <svg className='w-4 h-4 text-gray-700 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                  </svg>
                  <h3 className='text-base font-semibold text-gray-800'>Breed Information</h3>
                </div>

                <div className='space-y-3'>
                  {/* Breed Name */}
                  <div>
                    <label className='text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1'>
                      Breed Name
                    </label>
                    <input
                      type='text'
                      {...register('name', {
                        required: 'Breed name is required',
                        minLength: {
                          value: 2,
                          message: 'Name must be at least 2 characters long',
                        },
                      })}
                      placeholder='Enter breed name'
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      disabled={isLoading}
                    />
                    {errors.name && (
                      <span className='text-xs text-red-600 mt-0.5 block'>
                        {errors.name.message}
                      </span>
                    )}
                  </div>

                  {/* Pet Type */}
                  <div>
                    <label className='text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1'>
                      Pet Type
                    </label>
                    <select
                      {...register('petTypeId', { required: 'Pet type is required' })}
                      onChange={(e) => {
                        setValue('petTypeId', e.target.value);
                      }}
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                        errors.petTypeId ? 'border-red-500' : 'border-gray-300'
                      }`}
                      disabled={isLoading}
                    >
                      <option value=''>Select Pet Type</option>
                      {petTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                    {errors.petTypeId && (
                      <span className='text-xs text-red-600 mt-0.5 block'>
                        {errors.petTypeId.message}
                      </span>
                    )}
                  </div>

                  {/* Slug */}
                  <div>
                    <label className='text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1'>
                      Slug
                    </label>
                    <input
                      type='text'
                      readOnly
                      disabled
                      value={slugValue}
                      className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-600'
                    />
                    <input type='hidden' {...register('slug')} />
                    <p className='text-xs text-gray-500 mt-1'>
                      Automatically generated from name
                    </p>
                  </div>

                  {/* Description */}
                  <div>
                    <label className='text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1'>
                      Description
                    </label>
                    <textarea
                      {...register('description')}
                      placeholder='Enter breed description'
                      rows={3}
                      className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition'
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className='flex justify-end gap-2 pt-3 border-t'>
            <button
              type='button'
              onClick={onCancel}
              disabled={isLoading}
              className='px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={isLoading}
              className='px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium'
            >
              {isLoading ? 'Saving...' : petBreed ? 'Update' : 'Add'} Breed
            </button>
          </div>
        </form>
      </FormCard>
    </div>
  );
}
