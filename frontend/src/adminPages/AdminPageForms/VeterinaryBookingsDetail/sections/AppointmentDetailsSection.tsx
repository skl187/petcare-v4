import { AppointmentDetail } from '../VeterinaryBookingsDetail';
import { formatDateWithTime } from '../../../../utils/formatDate';

interface AppointmentDetailsSectionProps {
  appointment: AppointmentDetail;
}

export default function AppointmentDetailsSection({
  appointment,
}: AppointmentDetailsSectionProps) {
  return (
    <div className='bg-white rounded-lg shadow-md p-4'>
      <h2 className='text-base font-semibold text-gray-900 mb-4'>
        APPOINTMENT DETAILS
      </h2>

      <div className='grid grid-cols-2 gap-6'>
        {/* Date & Time */}
        <div>
          <h3 className='text-sm font-semibold text-gray-600 mb-2'>
            DATE & TIME
          </h3>
          <p className='text-gray-900 font-semibold text-base'>
            {formatDateWithTime(appointment.date, appointment.time)}
          </p>
        </div>

        {/* Reason */}
        <div>
          <h3 className='text-sm font-semibold text-gray-600 mb-2'>REASON</h3>
          <p className='text-gray-900 font-semibold text-base'>
            {appointment.reason}
          </p>
        </div>
      </div>

      {/* Notes */}
      <div className='mt-6'>
        <h3 className='text-sm font-semibold text-gray-600 mb-2'>NOTES</h3>
        <div className='bg-gray-50 rounded-lg p-3 border border-gray-200'>
          <p className='text-sm text-gray-700'>{appointment.notes}</p>
        </div>
      </div>
    </div>
  );
}
