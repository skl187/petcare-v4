import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import FormCard from '../../../components/form/FormCard';
import Badge from '../../../components/ui/badge/Badge';
import ImageUpload from '../../FormComponents/ImageUpload';

export interface PetTypeFormData {
  name: string;
  status: 1 | 0;
  slug?: string;
  image?: File | string;
}

export interface PetType {
  id: string;
  name: string;
  status: 1 | 0;
  slug?: string;
  image?: string;
}

interface PetTypeFormProps {
  petType?: PetType | null;
  onSubmit: (data: PetTypeFormData) => void;
  onCancel: () => void;
}

import { API_ENDPOINTS } from '../../../constants/api';

const API_BASE = API_ENDPOINTS.PET_TYPES.BASE;

const slugify = (s: string) =>
  s
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');

export default function PetTypeForm({
  petType,
  onSubmit,
  onCancel,
}: PetTypeFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<PetTypeFormData>({
    defaultValues: {
      name: petType?.name ?? '',
      status: petType?.status ?? 0,
      slug: petType?.slug ?? slugify(petType?.name ?? ''),
      image: petType?.image ?? undefined,
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
  const imageValue = watch('image');
  const slugValue = watch('slug');

  // sync slug with name
  useEffect(() => {
    const s = slugify(nameValue || '');
    setValue('slug', s, { shouldDirty: true });
  }, [nameValue, setValue]);

  // clear banner after 5s (only for success messages)
  useEffect(() => {
    if (!banner) return;
    if (banner.type === 'error') return; // Don't auto-dismiss errors
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

  const handleForm = async (data: PetTypeFormData) => {
    setIsLoading(true);
    setBanner(null);

    const payload = {
      name: data.name,
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

      if (petType) {
        // PUT
        res = await fetch(`${API_BASE}/${petType.id}`, {
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

      // Use either response.data or response root for returned object
      const returned = responseData?.data ?? responseData ?? {};

      setBanner({
        message: petType
          ? 'Pet type updated successfully!'
          : 'Pet type created successfully!',
        type: 'success',
      });

      const newData: PetTypeFormData = {
        name: returned?.name ?? payload.name,
        status: returned?.status ?? payload.status,
        slug: returned?.slug ?? payload.slug,
        image: data.image ?? petType?.image ?? '',
      };

      onSubmit(newData);
      reset();

      // close after banner shown for 5s
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = window.setTimeout(() => onCancel(), 5000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      console.error('PetTypeForm error:', err);
      // Show detailed error message
      setBanner({
        message: `${petType ? 'Update' : 'Create'} failed: ${message}. Please try again.`,
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='p-4 mx-auto max-w-4xl md:p-6'>
      {/* banner */}
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
        title={petType ? 'Edit Pet Type' : 'Create Pet Type'}
        onClose={onCancel}
      >
        <form
          id='pet-type-form'
          onSubmit={handleSubmit(handleForm)}
          className='space-y-8'
        >
          <section className='space-y-6'>
            <h3 className='text-lg font-semibold text-gray-800 border-b pb-2'>
              Pet Type Image
            </h3>
            <div className='flex flex-col items-center space-y-4'>
              <ImageUpload
                label='Upload Pet Type Image'
                shape='circle'
                size='md'
                maxSizeMB={3}
                value={imageValue}
                onChange={(file) =>
                  setValue('image', file || undefined, {
                    shouldDirty: true,
                    shouldTouch: true,
                  })
                }
                showRemove
              />
            </div>
          </section>

          <section className='space-y-6'>
            <h3 className='text-lg font-semibold text-gray-800 border-b pb-2'>
              Pet Type Details
            </h3>
            <div className='grid grid-cols-1 gap-6'>
              <div className='flex flex-col space-y-2'>
                <label
                  className='text-sm font-medium text-gray-700'
                  htmlFor='name'
                >
                  Pet Type Name *
                </label>
                <input
                  id='name'
                  type='text'
                  disabled={isLoading}
                  className={`px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                  {...register('name', {
                    required: 'Pet type name is required',
                    minLength: {
                      value: 2,
                      message: 'Pet type name must be at least 2 characters',
                    },
                  })}
                />
                {errors.name && (
                  <span className='text-sm text-red-600'>
                    {errors.name.message}
                  </span>
                )}
              </div>

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
                  value={slugValue}
                  className='px-4 py-2 border rounded-md bg-gray-50'
                />
                {/* register slug hidden so it's included in submitted data */}
                <input type='hidden' {...register('slug')} />
                <p className='text-xs text-gray-500'>
                  Automatically generated from name
                </p>
              </div>
            </div>
          </section>

          <section className='space-y-6'>
            <h3 className='text-lg font-semibold text-gray-800 border-b pb-2'>
              Status
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='flex flex-col space-y-2'>
                <label className='text-sm font-medium text-gray-700'>
                  Status
                </label>
                <div className='flex items-center gap-3'>
                  <Badge size='sm' color={status === 1 ? 'success' : 'error'}>
                    {status === 1 ? 'Active' : 'Inactive'}
                  </Badge>
                  <select
                    className='px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 border-gray-300'
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
          </section>

          <div className='flex flex-col-reverse sm:flex-row justify-end gap-4 pt-6'>
            <button
              type='button'
              onClick={onCancel}
              disabled={isLoading}
              className='px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={isLoading}
              className='px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition disabled:opacity-70'
            >
              {isLoading ? (
                <span className='flex items-center'>
                  <svg
                    className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    />
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    />
                  </svg>
                  {petType ? 'Updating...' : 'Creating...'}
                </span>
              ) : petType ? (
                'Update Pet Type'
              ) : (
                'Create Pet Type'
              )}
            </button>
          </div>
        </form>
      </FormCard>
    </div>
  );
}
