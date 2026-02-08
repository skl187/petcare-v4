import { AppointmentDetail } from '../VeterinaryBookingsDetail';

interface AppointmentDetailsSectionProps {
  appointment: AppointmentDetail;
}

export default function AppointmentDetailsSection({
  appointment,
}: AppointmentDetailsSectionProps) {
  return (
    <div className='bg-white rounded-lg shadow-md p-6'>
      <h2 className='text-lg font-bold text-gray-900 mb-6'>
        APPOINTMENT DETAILS
      </h2>

      <div className='grid grid-cols-2 gap-6'>
        {/* Date & Time */}
        <div>
          <h3 className='text-sm font-semibold text-gray-600 mb-2'>
            DATE & TIME
          </h3>
          <p className='text-gray-900 font-semibold text-lg'>
            {appointment.date} {appointment.time}
          </p>
        </div>

        {/* Reason */}
        <div>
          <h3 className='text-sm font-semibold text-gray-600 mb-2'>REASON</h3>
          <p className='text-gray-900 font-semibold text-lg'>
            {appointment.reason}
          </p>
        </div>
      </div>

      {/* Notes */}
      <div className='mt-6'>
        <h3 className='text-sm font-semibold text-gray-600 mb-2'>NOTES</h3>
        <div className='bg-gray-50 rounded-lg p-4 border border-gray-200'>
          <p className='text-gray-700'>{appointment.notes}</p>
        </div>
      </div>
    </div>
  );
}
