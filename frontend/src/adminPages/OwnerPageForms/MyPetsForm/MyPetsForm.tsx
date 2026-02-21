import { useEffect, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import FormCard from '../../../components/form/FormCard';
import DatePickerInput from '../../../components/form/DatePickerInput/DatePickerInput';
import { API_ENDPOINTS } from '../../../constants/api';
import {
  PetType,
  Breed,
} from '../../../components/ownerTables/MyPetsTable/MyPetsTable';

export interface MyPetFormData {
  name: string;
  slug: string;
  petTypeId: string;
  breedId: string;
  size: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  weight: number;
  height: number;
  weightUnit: 'kg' | 'lb';
  heightUnit: 'cm' | 'inch';
  additionalInfo?: {
    notes?: string;
  };
  status: 1 | 0;
}

export interface MyPetForEdit {
  id: string;
  name: string;
  slug: string;
  petTypeId: string;
  petTypeName?: string;
  breedId: string;
  breedName?: string;
  size: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  weight: number;
  height: number;
  weightUnit: 'kg' | 'lb';
  heightUnit: 'cm' | 'inch';
  additionalInfo?: {
    notes?: string;
  };
  status: number;
}

interface Props {
  pet?: MyPetForEdit | null;
  petTypes: PetType[];
  breeds: Breed[];
  onSubmit: (data: MyPetFormData) => void;
  onCancel: () => void;
}

const slugify = (str: string) =>
  str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');

// Format date string for HTML date input (expects YYYY-MM-DD format)
const formatDateForInput = (dateString: string) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (e) {
    return dateString;
  }
};

export default function MyPetForm({
  pet,
  petTypes,
  breeds,
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
    control,
  } = useForm<MyPetFormData>({
    mode: 'onChange',
    defaultValues: pet
      ? {
          name: pet.name,
          slug: pet.slug,
          petTypeId: pet.petTypeId,
          breedId: pet.breedId,
          size: pet.size,
          dateOfBirth: pet.dateOfBirth,
          gender: pet.gender,
          weight: pet.weight,
          height: pet.height,
          weightUnit: pet.weightUnit,
          heightUnit: pet.heightUnit,
          additionalInfo: pet.additionalInfo || { notes: '' },
          status: pet.status === 1 ? 1 : 0,
        }
      : {
          name: '',
          slug: '',
          petTypeId: '',
          breedId: '',
          size: '',
          dateOfBirth: '',
          gender: 'male',
          weight: 0,
          height: 0,
          weightUnit: 'kg',
          heightUnit: 'cm',
          additionalInfo: { notes: '' },
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
  const petTypeId = watch('petTypeId');

  // Auto-generate slug
  useEffect(() => {
    if (nameValue) {
      const slug = slugify(nameValue);
      setValue('slug', slug);
    }
  }, [nameValue, setValue]);

  // Reset form when pet changes (for editing)
  useEffect(() => {
    if (pet) {
      console.log('🔧 EDIT MODE - Pet data received:', {
        id: pet.id,
        name: pet.name,
        petTypeId: pet.petTypeId,
        breedId: pet.breedId,
        dateOfBirth: pet.dateOfBirth,
        gender: pet.gender,
      });

      const formData: MyPetFormData = {
        name: pet.name || '',
        slug: pet.slug || '',
        petTypeId: String(pet.petTypeId || ''),
        breedId: String(pet.breedId || ''),
        size: pet.size || '',
        dateOfBirth: pet.dateOfBirth ? formatDateForInput(pet.dateOfBirth) : '',
        gender: (pet.gender as 'male' | 'female' | 'other') || 'male',
        weight: pet.weight || 0,
        height: pet.height || 0,
        weightUnit: (pet.weightUnit as 'kg' | 'lb') || 'kg',
        heightUnit: (pet.heightUnit as 'cm' | 'inch') || 'cm',
        additionalInfo: pet.additionalInfo || { notes: '' },
        status: (pet.status === 1 ? 1 : 0) as 1 | 0,
      };

      console.log('📝 Resetting form with:', formData);
      reset(formData, { keepDefaultValues: false });
      console.log('✅ Form reset with pet data');
    }
  }, [pet, reset]);

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

  const handleForm = async (data: MyPetFormData) => {
    setIsLoading(true);
    setBanner(null);

    const payload = {
      name: data.name,
      slug: data.slug || slugify(data.name),
      petTypeId: data.petTypeId,
      breedId: data.breedId,
      size: data.size,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      weight: data.weight,
      height: data.height,
      weightUnit: data.weightUnit,
      heightUnit: data.heightUnit,
      additionalInfo: {
        notes: data.additionalInfo?.notes || '',
      },
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

      if (pet) {
        // PUT
        res = await fetch(API_ENDPOINTS.PETS.DETAIL(pet.id), {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload),
        });
      } else {
        // POST
        res = await fetch(API_ENDPOINTS.PETS.BASE, {
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
        message: pet
          ? 'Pet updated successfully!'
          : 'Pet created successfully!',
        type: 'success',
      });

      onSubmit(data);
      reset();

      // close after banner shown for 2s
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = window.setTimeout(() => onCancel(), 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      console.error('MyPetForm error:', err);
      setBanner({
        message: `${pet ? 'Update' : 'Create'} failed: ${message}. Please try again.`,
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBreeds = petTypeId
    ? breeds.filter((b) => {
        // Try multiple ways to match the petTypeId
        const breedPetTypeId = String(b.petTypeId || '').trim();
        const selectedPetTypeId = String(petTypeId).trim();
        const match = breedPetTypeId === selectedPetTypeId;
        return match;
      })
    : breeds;

  // If no breeds match after selection, log a warning and show all breeds
  const displayBreeds =
    filteredBreeds.length === 0 && petTypeId ? breeds : filteredBreeds;

  if (filteredBreeds.length === 0 && petTypeId && breeds.length > 0) {
    console.warn('⚠️ NO BREEDS MATCHED for petTypeId:', petTypeId);
    console.warn(
      'Using all breeds as fallback. Available breed petTypeIds:',
      breeds.map((b) => b.petTypeId),
    );
  }

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

      <FormCard title={pet ? 'Edit Pet' : 'Add New Pet'} onClose={onCancel}>
        <form onSubmit={handleSubmit(handleForm)}>
          <div className='grid lg:grid-cols-2 gap-6'>
            {/* LEFT COL: Pet Identity + Physical Details */}
            <div className='space-y-4'>
              {/* Pet Identity Card */}
              <div className='bg-white border border-gray-200 rounded-lg p-4'>
                <h4 className='text-sm font-semibold text-gray-800 mb-4'>Pet Identity</h4>
                <div className='grid grid-cols-2 gap-3'>
                  <div>
                    <label className='block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5'>
                      Pet Type <span className='text-red-500'>*</span>
                    </label>
                    <Controller
                      name='petTypeId'
                      control={control}
                      rules={{ required: 'Pet type is required' }}
                      render={({ field }) => (
                        <select
                          {...field}
                          className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                        >
                          <option value=''>Select Pet Type</option>
                          {petTypes.map((pt) => (
                            <option key={pt.id} value={pt.id}>
                              {pt.name}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                    {errors.petTypeId && (
                      <p className='text-xs text-red-600 mt-1'>{errors.petTypeId.message}</p>
                    )}
            </div>

                  <div>
                    <label className='block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5'>
                      Breed <span className='text-red-500'>*</span>
                    </label>
                    <Controller
                      name='breedId'
                      control={control}
                      rules={{ required: 'Breed is required' }}
                      render={({ field }) => (
                        <select
                          {...field}
                          className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                        >
                          <option value=''>Select Breed</option>
                          {displayBreeds.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.name}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                    {errors.breedId && (
                      <p className='text-xs text-red-600 mt-1'>{errors.breedId.message}</p>
                    )}
                  </div>

                  <div>
                    <label className='block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5'>
                      Pet Name <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='text'
                      {...register('name', { required: 'Pet name is required' })}
                      className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      placeholder='Enter pet name'
                    />
                    {errors.name && (
                      <p className='text-xs text-red-600 mt-1'>{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className='block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5'>
                      Slug <span className='text-gray-400 normal-case font-normal text-xs'>(auto-generated)</span>
                    </label>
                    <input
                      type='text'
                      {...register('slug')}
                      className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed'
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* Physical Details Card */}
              <div className='bg-white border border-gray-200 rounded-lg p-4'>
                <h4 className='text-sm font-semibold text-gray-800 mb-4'>Physical Details</h4>
                <div className='grid grid-cols-2 gap-3'>
                  <div>
                    <Controller
                      name='dateOfBirth'
                      control={control}
                      rules={{ required: 'Date of birth is required' }}
                      render={({ field }) => (
                        <DatePickerInput
                          label='Date of Birth'
                          value={field.value ? new Date(field.value) : null}
                          onChange={(date) => {
                            if (date) {
                              const year = date.getFullYear();
                              const month = String(date.getMonth() + 1).padStart(2, '0');
                              const day = String(date.getDate()).padStart(2, '0');
                              field.onChange(`${year}-${month}-${day}`);
                            }
                          }}
                          onBlur={field.onBlur}
                          required={true}
                          error={errors.dateOfBirth?.message}
                        />
                      )}
                    />
                  </div>

                  <div>
                    <label className='block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5'>
                      Size <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='text'
                      {...register('size', { required: 'Size is required' })}
                      className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      placeholder='e.g., Small, Medium, Large'
                    />
                    {errors.size && (
                      <p className='text-xs text-red-600 mt-1'>{errors.size.message}</p>
                    )}
                  </div>
                </div>

                <div className='grid grid-cols-3 gap-3 mt-3'>
                  <div className='col-span-2'>
                    <label className='block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5'>
                      Weight <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='number'
                      step='0.1'
                      {...register('weight', {
                        required: 'Weight is required',
                        min: { value: 0, message: 'Weight must be positive' },
                      })}
                      className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      placeholder='Enter weight'
                    />
                    {errors.weight && (
                      <p className='text-xs text-red-600 mt-1'>{errors.weight.message}</p>
                    )}
                  </div>
                  <div>
                    <label className='block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5'>
                      Unit
                    </label>
                    <Controller
                      name='weightUnit'
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                        >
                          <option value='kg'>kg</option>
                          <option value='lb'>lb</option>
                        </select>
                      )}
                    />
                  </div>
                </div>

                <div className='grid grid-cols-3 gap-3 mt-3'>
                  <div className='col-span-2'>
                    <label className='block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5'>
                      Height <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='number'
                      step='0.1'
                      {...register('height', {
                        required: 'Height is required',
                        min: { value: 0, message: 'Height must be positive' },
                      })}
                      className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      placeholder='Enter height'
                    />
                    {errors.height && (
                      <p className='text-xs text-red-600 mt-1'>{errors.height.message}</p>
                    )}
                  </div>
                  <div>
                    <label className='block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5'>
                      Unit
                    </label>
                    <Controller
                      name='heightUnit'
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                        >
                          <option value='cm'>cm</option>
                          <option value='inch'>inch</option>
                        </select>
                      )}
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COL: Gender + Status row, then Notes */}
            <div className='space-y-4'>
              {/* Gender + Status side by side */}
              <div className='grid grid-cols-2 gap-4'>
                {/* Gender Card */}
                <div className='bg-white border border-gray-200 rounded-lg p-4'>
                  <h4 className='text-sm font-semibold text-gray-800 mb-4'>Gender</h4>
                  <div className='space-y-2'>
                    {(['male', 'female', 'other'] as const).map((option) => (
                      <label key={option} className='flex items-center gap-3 cursor-pointer'>
                        <input
                          type='radio'
                          value={option}
                          {...register('gender', { required: 'Gender is required' })}
                          className='w-4 h-4 text-blue-600'
                        />
                        <span className='text-sm text-gray-700 capitalize'>{option}</span>
                      </label>
                    ))}
                  </div>
                  {errors.gender && (
                    <p className='text-xs text-red-600 mt-2'>{errors.gender.message}</p>
                  )}
                </div>

                {/* Status Card */}
                <div className='bg-white border border-gray-200 rounded-lg p-4'>
                  <h4 className='text-sm font-semibold text-gray-800 mb-4'>Status</h4>
                  <div className='mb-3'>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${Number(status) === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {Number(status) === 1 ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <Controller
                    name='status'
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      >
                        <option value={1}>Active</option>
                        <option value={0}>Inactive</option>
                      </select>
                    )}
                  />
                </div>
              </div>

              {/* Additional Notes Card */}
              <div className='bg-white border border-gray-200 rounded-lg p-4'>
                <h4 className='text-sm font-semibold text-gray-800 mb-4'>Additional Notes</h4>
                <textarea
                  {...register('additionalInfo.notes')}
                  className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  rows={3}
                  placeholder='Add any additional notes about the pet'
                />
              </div>
            </div>

            {/* ACTIONS */}
            <div className='lg:col-span-2 flex justify-end gap-3 pt-4 border-t'>
              <button
                type='button'
                onClick={onCancel}
                className='px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50'
              >
                Cancel
              </button>
              <button
                type='submit'
                disabled={isLoading}
                className='px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400'
              >
                {isLoading ? 'Saving...' : pet ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </form>
      </FormCard>
    </div>
  );
}
