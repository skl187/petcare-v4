import { useForm } from 'react-hook-form';
import FormCard from '../../../../components/form/FormCard';
import Badge from '../../../../components/ui/badge/Badge';
import DatePickerInput from '../../../../components/form/DatePickerInput/DatePickerInput';
// import { useState } from "react";
import type { VetBookingStatus } from '../../../../components/vetTables/Veterinary/VeterninaryBookingsTable/VeterinaryBookingsTable';

export interface VetBookingFormData {
  petName: string;
  ownerName: string;
  service: string;
  date: string;
  time: string;
  status: VetBookingStatus;
  notes?: string;
}

interface Props {
  booking?: VetBookingFormData & { id: number };
  onSubmit: (data: VetBookingFormData) => void;
  onCancel: () => void;
}

const services = [
  'Check-up',
  'Vaccination',
  'Surgery Consult',
  'Diagnostics',
  'Other',
];

const VeterinaryBookingsForm: React.FC<Props> = ({
  booking,
  onSubmit,
  onCancel,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { isSubmitting, errors },
  } = useForm<VetBookingFormData>({
    defaultValues: booking || {
      petName: '',
      ownerName: '',
      service: 'Check-up',
      date: '',
      time: '',
      status: 'Pending',
      notes: '',
    },
  });

  const status = watch('status');
  const getStatusColor = (s: VetBookingStatus) => {
    switch (s) {
      case 'Pending':
        return 'warning';
      case 'Approved':
        return 'info';
      case 'Completed':
        return 'success';
      case 'Cancelled':
        return 'error';
    }
  };

  const onFormSubmit = (data: VetBookingFormData) => {
    onSubmit(data);
    reset();
  };

  return (
    <div className='p-4 mx-auto max-w-3xl md:p-6'>
      <FormCard
        title={booking ? 'Update Booking' : 'New Booking'}
        onClose={onCancel}
      >
        <form onSubmit={handleSubmit(onFormSubmit)} className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label className='text-sm font-medium'>Pet Name *</label>
              <input
                className='mt-1 w-full px-3 py-2 border rounded-md'
                {...register('petName', { required: true })}
              />
            </div>
            <div>
              <label className='text-sm font-medium'>Owner Name *</label>
              <input
                className='mt-1 w-full px-3 py-2 border rounded-md'
                {...register('ownerName', { required: true })}
              />
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label className='text-sm font-medium'>Service *</label>
              <select
                className='mt-1 w-full px-3 py-2 border rounded-md'
                {...register('service', { required: true })}
              >
                {services.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <DatePickerInput
                label='Date *'
                value={watch('date')}
                onChange={(date) => {
                  if (date) {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    setValue('date', `${year}-${month}-${day}`);
                  }
                }}
                required={true}
                error={errors.date ? 'Date is required' : undefined}
              />
            </div>
            <div>
              <label className='text-sm font-medium'>Time *</label>
              <input
                type='time'
                className='mt-1 w-full px-3 py-2 border rounded-md'
                {...register('time', { required: true })}
              />
            </div>
          </div>

          <div>
            <label className='text-sm font-medium'>Notes</label>
            <textarea
              className='mt-1 w-full px-3 py-2 border rounded-md'
              rows={3}
              {...register('notes')}
            />
          </div>

          {/* Status Update (Vet control only) */}
          <div className='flex items-center gap-3'>
            <Badge size='sm' color={getStatusColor(status)}>
              {status}
            </Badge>
            <select
              className='px-3 py-2 border rounded-md'
              {...register('status')}
            >
              <option value='Pending'>Pending</option>
              <option value='Approved'>Approved</option>
              <option value='Completed'>Completed</option>
              <option value='Cancelled'>Cancelled</option>
            </select>
          </div>

          <div className='flex justify-end gap-3 pt-6'>
            <button
              type='button'
              onClick={onCancel}
              className='px-6 py-2 border rounded-md hover:bg-gray-50'
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type='submit'
              className='px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-70'
            >
              {isSubmitting ? 'Saving…' : booking ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </FormCard>
    </div>
  );
};

export default VeterinaryBookingsForm;
