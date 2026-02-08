import React, { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import FormCard from '../../../../components/form/FormCard';
import { MdClose } from 'react-icons/md';
import { API_ENDPOINTS } from '../../../../constants/api';
export interface Pet {
  id: string;
  name: string;
  slug?: string;
  image?: string;
}

export interface Veterinarian {
  id: string;
  first_name: string;
  last_name: string;
}

export interface Clinic {
  id: string;
  name: string;
}

export interface VetService {
  id: string;
  name: string;
  default_fee: number;
}

export interface ServiceSelection {
  service_id: string;
  service_name?: string;
  quantity: number;
  fee: number;
}

export interface UpcomingBookingFormData {
  user_id: string;
  pet_id: string;
  veterinarian_id: string;
  clinic_id: string;
  appointment_date: string;
  appointment_time: string;
  appointment_type:
    | 'consultation'
    | 'checkup'
    | 'vaccination'
    | 'surgery'
    | 'emergency'
    | 'followup'
    | 'telemedicine';
  chief_complaint: string;
  symptoms?: string[];
  notes?: string;
  service_ids: string[];
  service_selections?: ServiceSelection[];
  payment_type: 'online' | 'cash' | 'insurance';
  payment_method?: 'card' | 'upi' | 'bank_transfer';
  insurance_id?: string;
  total_amount?: number;
}

export interface BookingForEdit extends UpcomingBookingFormData {
  id: string;
  vet_service_ids?: any[];
  services?: any[];
  appointment_number?: string;
  priority?: string;
  status?: string;
  [key: string]: any;
}

interface Props {
  booking?: BookingForEdit;
  pets: Pet[];
  veterinarians: Veterinarian[];
  clinics: Clinic[];
  vetServices: VetService[];
  onSubmit: (data: UpcomingBookingFormData) => void;
  onCancel: () => void;
}

const appointmentTypes = [
  'consultation',
  'checkup',
  'vaccination',
  'surgery',
  'emergency',
  'followup',
  'telemedicine',
];

// ServiceMultiSelect Component
const ServiceMultiSelect: React.FC<{
  services: VetService[];
  selectedServices: ServiceSelection[];
  onChange: (services: ServiceSelection[]) => void;
  disabled?: boolean;
}> = ({ services, selectedServices, onChange, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectService = (service: VetService) => {
    const exists = selectedServices.find((s) => s.service_id === service.id);
    if (exists) {
      onChange(selectedServices.filter((s) => s.service_id !== service.id));
    } else {
      onChange([
        ...selectedServices,
        {
          service_id: service.id,
          service_name: service.name,
          quantity: 1,
          fee: service.default_fee,
        },
      ]);
    }
  };

  const handleRemove = (serviceId: string) => {
    onChange(selectedServices.filter((s) => s.service_id !== serviceId));
  };

  const handleQuantityChange = (serviceId: string, quantity: number) => {
    onChange(
      selectedServices.map((s) =>
        s.service_id === serviceId
          ? { ...s, quantity: Math.max(1, quantity) }
          : s,
      ),
    );
  };

  const handleFeeChange = (serviceId: string, fee: number) => {
    onChange(
      selectedServices.map((s) =>
        s.service_id === serviceId ? { ...s, fee: Math.max(0, fee) } : s,
      ),
    );
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isOpen && !(e.target as HTMLElement).closest('.service-dropdown')) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className='space-y-2 service-dropdown'>
      <button
        type='button'
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-left bg-white disabled:bg-gray-50'
      >
        {selectedServices.length > 0
          ? `${selectedServices.length} service(s) selected`
          : 'Select services'}
      </button>

      {isOpen && (
        <div className='absolute z-10 w-full mt-1 border border-gray-300 rounded-md bg-white shadow-lg'>
          {services.length === 0 ? (
            <div className='p-3 text-sm text-gray-500'>
              No services available
            </div>
          ) : (
            <div className='max-h-48 overflow-y-auto'>
              {services.map((s) => (
                <label
                  key={s.id}
                  className='flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer'
                >
                  <input
                    type='checkbox'
                    checked={selectedServices.some(
                      (sel) => sel.service_id === s.id,
                    )}
                    onChange={() => handleSelectService(s)}
                    className='w-4 h-4 rounded'
                  />
                  <span className='ml-2 text-sm'>
                    {s.name} (${s.default_fee})
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedServices.length > 0 && (
        <div className='space-y-2 p-3 bg-gray-50 rounded-md border border-gray-200'>
          {selectedServices.map((sel) => (
            <div
              key={sel.service_id}
              className='flex items-center justify-between gap-2 text-sm'
            >
              <div className='flex-1'>
                <span className='font-medium'>{sel.service_name}</span>
              </div>
              <div className='flex items-center gap-2'>
                <div className='flex items-center gap-1'>
                  <label className='text-xs'>Qty:</label>
                  <input
                    type='number'
                    min='1'
                    value={sel.quantity}
                    onChange={(e) =>
                      handleQuantityChange(
                        sel.service_id,
                        parseInt(e.target.value),
                      )
                    }
                    className='w-12 px-2 py-1 border border-gray-300 rounded text-sm'
                  />
                </div>
                <div className='flex items-center gap-1'>
                  <label className='text-xs'>Fee:</label>
                  <input
                    type='number'
                    min='0'
                    step='0.01'
                    value={sel.fee}
                    onChange={(e) =>
                      handleFeeChange(
                        sel.service_id,
                        parseFloat(e.target.value),
                      )
                    }
                    className='w-20 px-2 py-1 border border-gray-300 rounded text-sm'
                  />
                </div>
                <button
                  type='button'
                  onClick={() => handleRemove(sel.service_id)}
                  className='text-red-600 hover:text-red-800'
                >
                  <MdClose size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const UpcomingBookingsForm: React.FC<Props> = ({
  booking,
  pets,
  veterinarians,
  clinics,
  vetServices,
  onSubmit,
  onCancel,
}) => {
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset,
    control,
  } = useForm<UpcomingBookingFormData>({
    mode: 'onChange',
    defaultValues: booking
      ? {
          user_id:
            booking.user_id ||
            (() => {
              try {
                const userStr = sessionStorage.getItem('user');
                return userStr ? JSON.parse(userStr).id : '';
              } catch {
                return '';
              }
            })(),
          pet_id: booking.pet_id || pets[0]?.id || '',
          veterinarian_id:
            booking.veterinarian_id || veterinarians[0]?.id || '',
          clinic_id: booking.clinic_id || clinics[0]?.id || '',
          appointment_date: booking.appointment_date || '',
          appointment_time: booking.appointment_time || '',
          appointment_type: (booking.appointment_type as any) || 'checkup',
          chief_complaint: booking.chief_complaint || '',
          symptoms: booking.symptoms || [],
          notes: booking.notes || '',
          service_ids: booking.service_ids || [],
          service_selections: booking.service_selections || [],
          payment_type: (booking.payment_type as any) || 'cash',
          payment_method: booking.payment_method || 'card',
          insurance_id: booking.insurance_id || '',
        }
      : {
          user_id: (() => {
            try {
              const userStr = sessionStorage.getItem('user');
              return userStr ? JSON.parse(userStr).id : '';
            } catch {
              return '';
            }
          })(),
          pet_id: pets[0]?.id ?? '',
          veterinarian_id: veterinarians[0]?.id ?? '',
          clinic_id: clinics[0]?.id ?? '',
          appointment_date: '',
          appointment_time: '',
          appointment_type: 'checkup',
          chief_complaint: '',
          symptoms: [],
          notes: '',
          service_ids: [],
          service_selections: [],
          payment_type: 'cash',
          payment_method: 'card',
          insurance_id: '',
          total_amount: 0,
        },
  });

  const [symptomInput, setSymptomInput] = useState('');
  const [banner, setBanner] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const bannerTimerRef = useRef<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  const symptoms = watch('symptoms') || [];
  const paymentType = watch('payment_type');
  const serviceSelections = watch('service_selections') || [];

  // Auto-dismiss success banners
  useEffect(() => {
    if (!banner) return;
    if (banner.type === 'error') return;
    if (bannerTimerRef.current) window.clearTimeout(bannerTimerRef.current);
    bannerTimerRef.current = window.setTimeout(() => setBanner(null), 5000);
    return () => {
      if (bannerTimerRef.current) window.clearTimeout(bannerTimerRef.current);
    };
  }, [banner]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (bannerTimerRef.current) window.clearTimeout(bannerTimerRef.current);
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    };
  }, []);

  // Reset form when booking data changes (for edit mode)
  useEffect(() => {
    if (booking && booking.id) {
      // Handle vet_service_ids format (objects with quantity and fee)
      let serviceSelections: ServiceSelection[] = [];

      if (booking.vet_service_ids && Array.isArray(booking.vet_service_ids)) {
        serviceSelections = booking.vet_service_ids
          .map((item: any) => {
            if (typeof item === 'object' && item.service_id) {
              // Format from API with quantity and fee
              return {
                service_id: item.service_id,
                service_name:
                  booking.services?.find((s: any) => s.id === item.service_id)
                    ?.name || '',
                quantity: item.quantity || 1,
                fee: item.unit_fee || 0,
              };
            } else if (typeof item === 'string') {
              // Simple string ID format
              const service = vetServices.find((s) => s.id === item);
              return {
                service_id: item,
                service_name: service?.name || '',
                quantity: 1,
                fee: service?.default_fee || 0,
              };
            }
            return null;
          })
          .filter(Boolean) as ServiceSelection[];
      }

      const formData: UpcomingBookingFormData = {
        user_id: booking.user_id || '',
        pet_id: booking.pet_id || '',
        veterinarian_id: booking.veterinarian_id || '',
        clinic_id: booking.clinic_id || '',
        appointment_date: booking.appointment_date || '',
        appointment_time: booking.appointment_time || '',
        appointment_type: (booking.appointment_type as any) || 'checkup',
        chief_complaint: booking.chief_complaint || '',
        symptoms: booking.symptoms || [],
        notes: booking.notes || '',
        service_ids: Array.isArray(booking.service_ids)
          ? booking.service_ids.map((s: any) =>
              typeof s === 'string' ? s : s.service_id,
            )
          : [],
        service_selections: serviceSelections,
        payment_type: (booking.payment_type as any) || 'cash',
        payment_method: (booking.payment_method as any) || 'card',
        insurance_id: booking.insurance_id || '',
        total_amount: booking.total_amount || 0,
      };

      reset(formData, { keepDefaultValues: false });
    }
  }, [booking, reset, vetServices]);

  const parseResponse = async (res: Response) => {
    const txt = await res.text();
    try {
      return txt ? JSON.parse(txt) : {};
    } catch {
      return { message: txt || res.statusText };
    }
  };

  // Calculate total
  const calculateTotal = () => {
    return serviceSelections.reduce(
      (sum, sel) => sum + sel.fee * sel.quantity,
      0,
    );
  };

  const handleAddSymptom = () => {
    if (symptomInput.trim()) {
      setValue('symptoms', [...symptoms, symptomInput.trim()]);
      setSymptomInput('');
    }
  };

  const handleRemoveSymptom = (idx: number) => {
    setValue(
      'symptoms',
      symptoms.filter((_, i) => i !== idx),
    );
  };

  const handleFormSubmit = async (data: UpcomingBookingFormData) => {
    setBanner(null);

    const payload = {
      user_id:
        data.user_id ||
        (() => {
          try {
            const userStr = sessionStorage.getItem('user');
            return userStr ? JSON.parse(userStr).id : '';
          } catch {
            return '';
          }
        })() ||
        '',
      pet_id: data.pet_id,
      veterinarian_id: data.veterinarian_id,
      clinic_id: data.clinic_id,
      appointment_date: data.appointment_date,
      appointment_time: data.appointment_time,
      appointment_type: data.appointment_type,
      chief_complaint: data.chief_complaint,
      symptoms: data.symptoms && data.symptoms.length > 0 ? data.symptoms : [],
      notes: data.notes || '',
      service_ids:
        serviceSelections && serviceSelections.length > 0
          ? serviceSelections.map((s) => s.service_id)
          : [],
      payment_info: {
        payment_type: data.payment_type,
        ...(data.payment_type === 'online' && { method: data.payment_method }),
        ...(data.payment_type === 'insurance' && {
          insurance_id: data.insurance_id,
        }),
        amount_to_pay: calculateTotal(),
      },
    };

    try {
      const token = sessionStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      let res: Response;

      if (booking) {
        res = await fetch(API_ENDPOINTS.APPOINTMENTS.DETAIL(booking.id), {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(API_ENDPOINTS.APPOINTMENTS.BASE, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });
      }

      const responseData = await parseResponse(res);

      if (!res.ok) {
        const errorMsg =
          responseData?.message ||
          responseData?.error ||
          (responseData?.errors && responseData.errors[0]?.message) ||
          res.statusText;
        throw new Error(errorMsg);
      }

      setBanner({
        message: booking
          ? 'Appointment updated successfully!'
          : 'Appointment created successfully!',
        type: 'success',
      });

      onSubmit(data);
      reset();

      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = window.setTimeout(() => onCancel(), 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      console.error('UpcomingBookingsForm error:', err);
      setBanner({
        message: `${booking ? 'Update' : 'Create'} failed: ${message}. Please try again.`,
        type: 'error',
      });
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
        title={booking ? 'Edit Appointment' : 'New Appointment'}
        onClose={onCancel}
      >
        <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-8'>
          <section className='space-y-6'>
            <h3 className='text-lg font-semibold border-b pb-2'>
              Appointment Details
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Pet *
                </label>
                <Controller
                  name='pet_id'
                  control={control}
                  rules={{ required: 'Pet is required' }}
                  render={({ field }) => (
                    <select
                      {...field}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.pet_id ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value=''>Select a pet</option>
                      {pets.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.pet_id && (
                  <p className='text-sm text-red-600 mt-1'>
                    {errors.pet_id.message as string}
                  </p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Veterinarian *
                </label>
                <Controller
                  name='veterinarian_id'
                  control={control}
                  rules={{ required: 'Veterinarian is required' }}
                  render={({ field }) => (
                    <select
                      {...field}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.veterinarian_id
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                    >
                      <option value=''>Select a veterinarian</option>
                      {veterinarians.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.first_name} {v.last_name}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.veterinarian_id && (
                  <p className='text-sm text-red-600 mt-1'>
                    {errors.veterinarian_id.message as string}
                  </p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Clinic *
                </label>
                <Controller
                  name='clinic_id'
                  control={control}
                  rules={{ required: 'Clinic is required' }}
                  render={({ field }) => (
                    <select
                      {...field}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.clinic_id ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value=''>Select a clinic</option>
                      {clinics.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.clinic_id && (
                  <p className='text-sm text-red-600 mt-1'>
                    {errors.clinic_id.message as string}
                  </p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Appointment Type *
                </label>
                <Controller
                  name='appointment_type'
                  control={control}
                  rules={{ required: 'Appointment type is required' }}
                  render={({ field }) => (
                    <select
                      {...field}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.appointment_type
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {appointmentTypes.map((t) => (
                        <option key={t} value={t}>
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.appointment_type && (
                  <p className='text-sm text-red-600 mt-1'>
                    {errors.appointment_type.message as string}
                  </p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Date *
                </label>
                <Controller
                  name='appointment_date'
                  control={control}
                  rules={{ required: 'Date is required' }}
                  render={({ field }) => (
                    <input
                      type='date'
                      {...field}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.appointment_date
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                    />
                  )}
                />
                {errors.appointment_date && (
                  <p className='text-sm text-red-600 mt-1'>
                    {errors.appointment_date.message as string}
                  </p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Time *
                </label>
                <Controller
                  name='appointment_time'
                  control={control}
                  rules={{ required: 'Time is required' }}
                  render={({ field }) => (
                    <input
                      type='time'
                      {...field}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.appointment_time
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                    />
                  )}
                />
                {errors.appointment_time && (
                  <p className='text-sm text-red-600 mt-1'>
                    {errors.appointment_time.message as string}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Clinical Details */}
          <section className='space-y-6'>
            <h3 className='text-lg font-semibold border-b pb-2'>
              Clinical Details
            </h3>
            <div className='space-y-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Chief Complaint *
                </label>
                <Controller
                  name='chief_complaint'
                  control={control}
                  rules={{ required: 'Chief complaint is required' }}
                  render={({ field }) => (
                    <input
                      type='text'
                      placeholder='e.g., Routine checkup, Injury, etc.'
                      {...field}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.chief_complaint
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                    />
                  )}
                />
                {errors.chief_complaint && (
                  <p className='text-sm text-red-600 mt-1'>
                    {errors.chief_complaint.message as string}
                  </p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Symptoms (optional)
                </label>
                <div className='flex gap-2 mb-2'>
                  <input
                    type='text'
                    placeholder='Add symptom (e.g., lethargy, vomiting)'
                    value={symptomInput}
                    onChange={(e) => setSymptomInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSymptom();
                      }
                    }}
                    className='flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                  <button
                    type='button'
                    onClick={handleAddSymptom}
                    className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'
                  >
                    Add
                  </button>
                </div>
                {symptoms.length > 0 && (
                  <div className='flex flex-wrap gap-2'>
                    {symptoms.map((sym, idx) => (
                      <div
                        key={idx}
                        className='inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm'
                      >
                        {sym}
                        <button
                          type='button'
                          onClick={() => handleRemoveSymptom(idx)}
                          className='text-blue-600 hover:text-blue-800'
                        >
                          <MdClose size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Notes (optional)
                </label>
                <Controller
                  name='notes'
                  control={control}
                  render={({ field }) => (
                    <textarea
                      placeholder='Add any additional notes about the appointment'
                      {...field}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                      rows={3}
                    />
                  )}
                />
              </div>
            </div>
          </section>

          {/* Services */}
          <section className='space-y-6'>
            <h3 className='text-lg font-semibold border-b pb-2'>Services</h3>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Select Services
              </label>
              <Controller
                name='service_selections'
                control={control}
                render={({ field }) => (
                  <ServiceMultiSelect
                    services={vetServices}
                    selectedServices={field.value || []}
                    onChange={field.onChange}
                    disabled={isSubmitting}
                  />
                )}
              />
            </div>
          </section>

          {/* Payment Information */}
          <section className='space-y-6'>
            <h3 className='text-lg font-semibold border-b pb-2'>
              Payment Information
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Payment Type *
                </label>
                <Controller
                  name='payment_type'
                  control={control}
                  rules={{ required: 'Payment type is required' }}
                  render={({ field }) => (
                    <select
                      {...field}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.payment_type
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                    >
                      <option value='cash'>Cash at Clinic</option>
                      <option value='online'>Online Payment</option>
                      <option value='insurance'>Insurance</option>
                    </select>
                  )}
                />
                {errors.payment_type && (
                  <p className='text-sm text-red-600 mt-1'>
                    {errors.payment_type.message as string}
                  </p>
                )}
              </div>

              {paymentType === 'online' && (
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Payment Method *
                  </label>
                  <Controller
                    name='payment_method'
                    control={control}
                    rules={{ required: 'Payment method is required' }}
                    render={({ field }) => (
                      <select
                        {...field}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.payment_method
                            ? 'border-red-500'
                            : 'border-gray-300'
                        }`}
                      >
                        <option value='card'>Card</option>
                        <option value='upi'>UPI</option>
                        <option value='bank_transfer'>Bank Transfer</option>
                      </select>
                    )}
                  />
                  {errors.payment_method && (
                    <p className='text-sm text-red-600 mt-1'>
                      {errors.payment_method.message as string}
                    </p>
                  )}
                </div>
              )}

              {paymentType === 'insurance' && (
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Insurance ID *
                  </label>
                  <Controller
                    name='insurance_id'
                    control={control}
                    rules={
                      paymentType === 'insurance'
                        ? { required: 'Insurance ID is required' }
                        : {}
                    }
                    render={({ field }) => (
                      <input
                        type='text'
                        placeholder='e.g., INS-12345-6789'
                        {...field}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.insurance_id
                            ? 'border-red-500'
                            : 'border-gray-300'
                        }`}
                      />
                    )}
                  />
                  {errors.insurance_id && (
                    <p className='text-sm text-red-600 mt-1'>
                      {errors.insurance_id.message as string}
                    </p>
                  )}
                </div>
              )}

              <div className='md:col-span-2 p-4 bg-blue-50 border border-blue-200 rounded-md'>
                <div className='text-sm font-medium text-gray-700 mb-2'>
                  Total Amount
                </div>
                <div className='text-3xl font-bold text-blue-600'>
                  ${calculateTotal().toFixed(2)}
                </div>
                <div className='text-xs text-gray-600 mt-2'>
                  {serviceSelections.length} service(s) selected
                </div>
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className='flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t'>
            <button
              type='button'
              onClick={onCancel}
              className='px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium'
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={isSubmitting}
              className='px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-medium'
            >
              {isSubmitting
                ? booking
                  ? 'Updating...'
                  : 'Creating...'
                : booking
                  ? 'Update Appointment'
                  : 'Create Appointment'}
            </button>
          </div>
        </form>
      </FormCard>
    </div>
  );
};

export default UpcomingBookingsForm;
